const mongoose = require("mongoose");
const Group = require("../models/group");
const Message = require("../models/message");
const User = require("../models/user");
const Team = require("../models/team");
const { getIO, notifyNewMember, screenShares, activeCalls } = require("../socket/socketHandler");
const sanitizeHtml = require("sanitize-html");


const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const userId = req.user._id;

        if (!name || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                message: "Tên nhóm và danh sách thành viên là bắt buộc",
            });
        }

        // Kiểm tra role của người dùng
        const user = await User.findById(userId).select("role");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Nếu user có role 'company', bỏ qua kiểm tra leader/team
        if (user.role !== "company") {
            const team = await Team.findOne({ assignedLeader: userId });
            if (!team) {
                return res.status(403).json({
                    message: "Bạn không phải leader của team nào",
                });
            }

            // Kiểm tra từng thành viên có thuộc team không
            for (const memberId of members) {
                const member = await User.findById(memberId);
                if (!member) {
                    return res.status(404).json({ message: `Không tìm thấy người dùng với ID ${memberId}` });
                }

                if (!team.assignedMembers.map(id => id.toString()).includes(memberId.toString()) &&
                    userId.toString() !== memberId.toString()) {
                    return res.status(400).json({
                        message: `Người dùng ${memberId} không thuộc team`,
                    });
                }
            }
        }

        // Đảm bảo người tạo nhóm cũng là thành viên
        const membersSet = new Set(members.map(id => id.toString()));
        membersSet.add(userId.toString());
        const finalMembers = Array.from(membersSet);

        // Tạo nhóm
        const group = new Group({ name, members: finalMembers });
        await group.save();

        // Gửi thông báo cho các thành viên
        for (const memberId of finalMembers) {
            const member = await User.findById(memberId).select("name");
            notifyNewMember(group._id, memberId, member.name);
        }

        // Lấy nhóm với thông tin tên thành viên
        const populatedGroup = await Group.findById(group._id).populate("members", "name");

        return res.status(201).json({
            message: "Tạo nhóm thành công",
            group: populatedGroup,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi tạo nhóm",
            error: error.message,
        });
    }
};

const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role; // Giả sử role được lưu trong req.user

        let groups;
        if (role === "company") {
            // Nếu role là company, lấy tất cả nhóm
            groups = await Group.find().populate("members", "name email");
        } else {
            // Nếu không phải company, chỉ lấy nhóm mà user là thành viên
            groups = await Group.find({ members: userId }).populate("members", "name email");
        }

        return res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách nhóm",
            error: error.message,
        });
    }
};

const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const leaderId = req.user._id;

        if (!userId) {
            return res.status(400).json({ message: "userId là bắt buộc" });
        }

        // Tìm nhóm
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        // Lấy thông tin user thực hiện hành động
        const user = await User.findById(leaderId).select("role");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng thực hiện" });
        }

        const groupMemberIds = group.members.filter(id => id != null).map(id => id.toString());

        // ✅ Nếu là company thì bỏ qua kiểm tra team
        if (user.role === "company") {
            if (!groupMemberIds.includes(userId.toString())) {
                group.members.push(userId);
                await group.save();

                const addedUser = await User.findById(userId).select("name");
                notifyNewMember(groupId, userId, addedUser.name);
            }

            const populatedGroup = await Group.findById(groupId).populate("members", "name");
            return res.status(200).json({
                message: "Thêm thành viên thành công (bởi company)",
                group: populatedGroup,
            });
        }

        // ❗ Nếu không phải company, kiểm tra xem user có phải leader không
        const team = await Team.findOne({ assignedLeader: leaderId });
        if (!team) {
            return res.status(403).json({
                message: "Bạn không quản lý team nào, không thể thêm thành viên vào nhóm",
            });
        }

        // Kiểm tra xem user cần thêm có thuộc team của leader không
        const assignedMemberIds = team.assignedMembers
            .filter(id => id != null)
            .map(id => id.toString());

        if (!assignedMemberIds.includes(userId.toString())) {
            return res.status(400).json({
                message: "Người dùng này không thuộc team của bạn",
            });
        }

        // Thêm vào nhóm nếu chưa có
        if (!groupMemberIds.includes(userId.toString())) {
            group.members.push(userId);
            await group.save();

            const addedUser = await User.findById(userId).select("name");
            notifyNewMember(groupId, userId, addedUser.name);
        }

        const populatedGroup = await Group.findById(groupId).populate("members", "name");

        res.status(200).json({
            message: "Thêm thành viên thành công",
            group: populatedGroup,
        });

    } catch (error) {
        console.error("Lỗi khi thêm thành viên:", error);
        res.status(500).json({
            message: "Lỗi khi thêm thành viên",
            error: error.message,
        });
    }
};

const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const { message } = req.body;
        const file = req.file;

        if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        if (!message && !file) {
            return res.status(400).json({ message: "Phải có tin nhắn hoặc ảnh" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Nhóm không tồn tại" });

        const user = await User.findById(userId).select("name role");
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        if (user.role !== "company") {
            const memberIds = group.members.map((id) => id.toString());
            if (!memberIds.includes(userId.toString())) {
                return res.status(403).json({ message: "Không có quyền gửi tin nhắn trong nhóm này" });
            }
        }

        const sanitizedMessage = message
            ? sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} })
            : "";

        const newMessage = new Message({
            groupId,
            senderId: userId,
            message: sanitizedMessage,
            fileName: file?.originalname || null,
            fileSize: file?.size || null,
            imageUrl: file ? `/uploads/reports/${file.filename}` : null,
            fileId: file ? `file_${Date.now()}` : null,
            fileType: file?.mimetype || null,
            timestamp: new Date(),
        });

        await newMessage.save();

        const io = getIO();
        io.to(groupId).emit("group-message", {
            _id: newMessage._id,
            groupId,
            senderId: userId,
            senderName: user.name,
            message: sanitizedMessage,
            imageUrl: newMessage.imageUrl,
            fileName: newMessage.fileName,
            fileSize: newMessage.fileSize,
            fileType: newMessage.fileType,
            fileId: newMessage.fileId,
            timestamp: newMessage.timestamp.toISOString(),
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        res.status(500).json({ message: "Lỗi khi gửi tin nhắn", error: error.message });
    }
};

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { skip = 0, limit = 50 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "ID nhóm không hợp lệ" });
        }

        const messages = await Message.find({ groupId })
            .sort({ timestamp: 1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate("senderId", "name");

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            groupId: msg.groupId,
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            message: msg.message,
            timestamp: msg.timestamp,
            imageUrl: msg.imageUrl,
            fileId: msg.fileId,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileType: msg.fileType,
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy tin nhắn", error: error.message });
    }
};

const recallMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "ID tin nhắn không hợp lệ" });
        }

        const message = await Message.findById(messageId).populate("senderId", "name");
        if (!message) {
            return res.status(404).json({ message: "Tin nhắn không tồn tại" });
        }

        if (message.senderId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền thu hồi tin nhắn này" });
        }

        if (message.isRecalled) {
            return res.status(400).json({ message: "Tin nhắn đã được thu hồi trước đó" });
        }

        // Đánh dấu tin nhắn đã thu hồi và xóa tham chiếu đến ảnh (nếu có)
        message.isRecalled = true;
        message.message = "Tin nhắn đã bị thu hồi";
        message.imageUrl = null; // Xóa URL ảnh
        message.fileName = null; // Xóa tên file
        message.fileSize = null; // Xóa kích thước file
        message.fileType = null; // Xóa loại file
        message.fileId = null; // Xóa ID file
        await message.save();

        const io = getIO();
        io.to(message.groupId.toString()).emit("message-recalled", {
            messageId: message._id,
            groupId: message.groupId,
            senderId: userId,
            senderName: message.senderId.name,
            isRecalled: true,
            message: "Tin nhắn đã bị thu hồi",
            imageUrl: null, // Đảm bảo ảnh không còn được gửi
            fileName: null,
            fileSize: null,
            fileType: null,
            fileId: null,
            timestamp: message.timestamp.toISOString(),
        });

        res.status(200).json({ message: "Thu hồi tin nhắn và ảnh (nếu có) thành công" });
    } catch (error) {
        console.error("Lỗi khi thu hồi tin nhắn:", error);
        res.status(500).json({ message: "Lỗi khi thu hồi tin nhắn", error: error.message });
    }
};
const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newMessage } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "ID tin nhắn không hợp lệ" });
        }

        if (!newMessage || newMessage.trim() === "") {
            return res.status(400).json({ message: "Tin nhắn mới không được để trống" });
        }

        const message = await Message.findById(messageId).populate("senderId", "name");
        if (!message) {
            return res.status(404).json({ message: "Tin nhắn không tồn tại" });
        }

        if (message.senderId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa tin nhắn này" });
        }

        if (message.isRecalled) {
            return res.status(400).json({ message: "Tin nhắn đã bị thu hồi, không thể chỉnh sửa" });
        }

        const sanitizedMessage = sanitizeHtml(newMessage, { allowedTags: [], allowedAttributes: {} });
        message.message = sanitizedMessage;
        message.isEdited = true;
        await message.save();

        const io = getIO();
        io.to(message.groupId.toString()).emit("message-edited", {
            messageId: message._id,
            groupId: message.groupId,
            senderId: userId,
            senderName: message.senderId.name,
            message: sanitizedMessage,
            isEdited: true,
            timestamp: message.timestamp.toISOString(),
        });

        res.status(200).json({ message: "Chỉnh sửa tin nhắn thành công" });
    } catch (error) {
        console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
        res.status(500).json({ message: "Lỗi khi chỉnh sửa tin nhắn", error: error.message });
    }
};




const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const leaderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        const team = await Team.findOne({ assignedLeader: leaderId });
        if (!team) {
            return res.status(403).json({ message: "Bạn không phải leader của team nào" });
        }

        if (userId.toString() === leaderId.toString()) {
            return res.status(400).json({ message: "Leader không thể tự xóa mình khỏi nhóm" });
        }

        const groupMemberIds = group.members.map(id => id.toString());
        if (!groupMemberIds.includes(userId.toString())) {
            return res.status(400).json({ message: "Người dùng không có trong nhóm" });
        }

        const assignedMemberIds = team.assignedMembers.map(id => id.toString());
        if (!assignedMemberIds.includes(userId.toString())) {
            return res.status(400).json({ message: "Người dùng không thuộc team của bạn" });
        }

        group.members = group.members.filter(id => id.toString() !== userId.toString());
        await group.save();

        const user = await User.findById(userId).select("name");
        notifyNewMember(groupId, userId, user.name, true); // Thông báo rời nhóm

        const populatedGroup = await Group.findById(groupId).populate("members", "name");

        res.status(200).json({
            message: `Đã xóa thành viên ${user.name} khỏi nhóm`,
            group: populatedGroup
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa thành viên", error: error.message });
    }
};

const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        const groupMemberIds = group.members.map(id => id.toString());
        if (!groupMemberIds.includes(userId.toString())) {
            return res.status(400).json({ message: "Bạn không có trong nhóm" });
        }

        group.members = group.members.filter(id => id.toString() !== userId.toString());
        await group.save();

        const user = await User.findById(userId).select("name");
        notifyNewMember(groupId, userId, user.name, true); // Thông báo rời nhóm

        res.status(200).json({ message: "Rời nhóm thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi rời nhóm", error: error.message });
    }
};




const startCall = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "ID nhóm không hợp lệ" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        if (!group.members.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: "Bạn không có trong nhóm" });
        }

        // Gửi tín hiệu đến tất cả thành viên trong nhóm để chuẩn bị signaling
        const io = getIO();
        group.members.forEach(memberId => {
            if (memberId.toString() !== userId.toString()) {
                io.to(memberId.toString()).emit("call-started", {
                    groupId,
                    callerId: userId,
                });
            }
        });

        res.status(200).json({ message: "Khởi tạo cuộc gọi thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi khởi tạo cuộc gọi", error: error.message });
    }
};

const startScreenShare = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const { offer } = req.body; // 🎯 Nhận offer từ client

        if (!offer || !offer.sdp || !offer.type) {
            return res.status(400).json({ message: "Offer không hợp lệ" });
        }

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "ID nhóm không hợp lệ" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        if (!group.members.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: "Bạn không có trong nhóm" });
        }

        const io = getIO();

        group.members.forEach(memberId => {
            if (memberId.toString() !== userId.toString()) {
                io.to(memberId.toString()).emit("screen-share-started", {
                    groupId,
                    userId,
                    userName: req.user.name || "Không tên", // hoặc lấy từ DB
                    offer, // ✅ Gửi offer vào socket event
                });
            }
        });

        res.status(200).json({ message: "Khởi tạo chia sẻ màn hình thành công" });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi khởi tạo chia sẻ màn hình",
            error: error.message,
        });
    }
};

const getCallStatus = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "ID nhóm không hợp lệ" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        if (!group.members.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: "Bạn không có trong nhóm" });
        }

        const activeCall = activeCalls.get(groupId) || new Set();
        const screenShare = screenShares.get(groupId) || new Set();

        const participants = await Promise.all([...activeCall].map(async (id) => {
            const user = await User.findById(id).select("name");
            return user ? { userId: id, userName: user.name } : null;
        }));

        const screenSharers = await Promise.all([...screenShare].map(async (id) => {
            const user = await User.findById(id).select("name");
            return user ? { userId: id, userName: user.name } : null;
        }));

        res.status(200).json({
            groupId,
            isCallActive: activeCall.size > 0,
            participants: participants.filter(Boolean),
            isScreenShareActive: screenShare.size > 0,
            screenSharers: screenSharers.filter(Boolean),
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy trạng thái cuộc gọi", error: error.message });
    }
};

// API để khởi tạo truyền file P2P
const startFileTransfer = async (req, res) => {
    try {
        const { fileName, fileSize } = req.body;
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "ID nhóm không hợp lệ" });
        }

        if (!fileName || !fileSize) {
            return res.status(400).json({ message: "Tên file và kích thước file là bắt buộc" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Nhóm không tồn tại" });
        }

        if (!group.members.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: "Bạn không thuộc nhóm này" });
        }

        const sanitizedFileName = sanitizeHtml(fileName, {
            allowedTags: [],
            allowedAttributes: {},
        });

        const fileId = `file_${Date.now()}`;

        const io = getIO();
        group.members.forEach(memberId => {
            if (memberId.toString() !== userId.toString()) {
                io.to(memberId.toString()).emit("file-transfer", {
                    groupId,
                    senderId: userId,
                    fileId,
                    fileName: sanitizedFileName,
                    fileSize,
                });
            }
        });

        await Message.create({
            groupId,
            senderId: userId,
            fileName: sanitizedFileName,
            fileSize,
            fileId,
            timestamp: new Date(),
        });

        res.status(200).json({ message: "Khởi tạo truyền file thành công", fileId });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi khởi tạo truyền file", error: error.message });
    }
};

module.exports = {
    createGroup,
    getGroups,
    addMember,
    getGroupMessages,
    sendGroupMessage,
    recallMessage,
    editMessage,

    removeMember,
    leaveGroup,


    startCall,
    getCallStatus,
    startScreenShare,
    startFileTransfer,
    // sendImageMessage
};
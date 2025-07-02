const mongoose = require("mongoose");
const Group = require("../models/group");

let ioInstance;
const onlineUsers = new Map(); // userId -> socketId
const socketToUser = new Map(); // socketId -> userId
const groupMembers = new Map(); // groupId -> Set<userId>
const activeCalls = new Map(); // groupId -> Set<userId>
const screenShares = new Map(); // groupId -> Set<userId>
const fileTransfers = new Map(); // future use

function getIO() {
    if (!ioInstance) throw new Error("Socket.IO has not been initialized");
    return ioInstance;
}

function getSocketIdByUserId(userId) {
    return onlineUsers.get(userId);
}

function isUserOnline(userId) {
    return onlineUsers.has(userId);
}

function getGroupMembers(groupId) {
    return Array.from(groupMembers.get(groupId) || []);
}

async function notifyNewMember(groupId, memberId, memberName, isLeaving = false) {
    const io = getIO();

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        console.error(`Invalid group ID: ${groupId}`);
        return;
    }

    try {
        const group = await Group.findById(groupId).populate("members", "name").lean();
        if (!group) {
            console.error(`Group not found: ${groupId}`);
            return;
        }

        io.to(groupId).emit("new-member", {
            groupId,
            memberName,
            isLeaving,
            group: {
                _id: group._id,
                name: group.name,
                members: group.members,
            },
        });

        console.log(`Notified ${isLeaving ? "leave" : "join"} for ${memberName} in group ${groupId}`);
    } catch (error) {
        console.error(`Error in notifyNewMember (${groupId}, ${memberId}):`, error);
    }
}

function setupSocket(io) {
    ioInstance = io;
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("user-online", async (userId) => {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.warn("❌ user-online: userId không hợp lệ:", userId);
                return;
            }

            // Gán userId <-> socketId
            onlineUsers.set(userId, socket.id);
            socketToUser.set(socket.id, userId);
            socket.join(userId); // để gửi riêng cho người dùng này

            console.log(`✅ user-online: User ${userId} kết nối với socket ${socket.id}`);

            try {
                const groups = await Group.find({ members: userId }).select("_id");

                groups.forEach((group) => {
                    const groupId = group._id.toString();
                    socket.join(groupId); // Tham gia room nhóm
                    if (!groupMembers.has(groupId)) {
                        groupMembers.set(groupId, new Set());
                    }
                    groupMembers.get(groupId).add(userId);
                    console.log(`➡️ User ${userId} joined group room ${groupId}`);
                });

                // Gửi tới mọi người rằng user này đang online
                io.emit("user-online", userId);
            } catch (err) {
                console.error("❌ Lỗi khi user-online join nhóm:", err);
            }
        });

        socket.on("user-logout", async (userId) => {
            if (!mongoose.Types.ObjectId.isValid(userId)) return;

            onlineUsers.delete(userId);
            socketToUser.delete(socket.id);

            for (const [groupId, members] of groupMembers.entries()) {
                if (!members.has(userId)) continue;

                members.delete(userId);
                await notifyNewMember(groupId, userId, userId, true);

                activeCalls.get(groupId)?.delete(userId);
                if (activeCalls.get(groupId)?.size === 0) activeCalls.delete(groupId);
                io.to(groupId).emit("call-ended", { groupId, userId });

                screenShares.get(groupId)?.delete(userId);
                if (screenShares.get(groupId)?.size === 0) screenShares.delete(groupId);
                io.to(groupId).emit("screen-share-stopped", { groupId, userId });

                if (members.size === 0) groupMembers.delete(groupId);
            }

            io.emit("user-offline", userId);
            console.log(`User ${userId} logged out and disconnected`);

            socket.disconnect(true);
        });

        socket.on("join-group", async ({ userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            try {
                const group = await Group.findById(groupId);
                if (!group || !group.members.map(id => id.toString()).includes(userId)) {
                    console.warn(`User ${userId} not in group ${groupId}`);
                    return;
                }

                if (!groupMembers.has(groupId)) groupMembers.set(groupId, new Set());
                groupMembers.get(groupId).add(userId);
                socket.join(groupId);

                await notifyNewMember(groupId, userId, userId);
                console.log(`User ${userId} joined group ${groupId}`);
            } catch (error) {
                console.error(`Error joining group ${groupId}:`, error);
            }
        });

        socket.on("group-message", ({ _id, groupId, senderId, senderName, message, fileUrl, fileName, fileSize, fileType, fileId, timestamp }) => {
            if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            io.to(groupId).emit("group-message", {
                _id,
                groupId,
                senderId,
                senderName,
                message,
                fileUrl,
                fileName,
                fileSize,
                fileType,
                fileId,
                timestamp
            });
        });
        socket.on("typing", ({ userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;
            socket.to(groupId).emit("typing", { userId });
        });

        socket.on("recall-message", async ({ messageId, userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
                console.warn("Invalid IDs");
                return;
            }

            try {
                const message = await mongoose.model("Message").findById(messageId).populate("senderId", "name");
                if (!message) {
                    console.warn(`Message ${messageId} not found`);
                    return;
                }

                if (message.senderId._id.toString() !== userId.toString()) {
                    console.warn(`User ${userId} not authorized to recall message ${messageId}`);
                    return;
                }

                io.to(groupId).emit("message-recalled", {
                    messageId,
                    groupId,
                    senderId: userId,
                    senderName: message.senderId.name,
                    isRecalled: true,
                    message: "Tin nhắn đã bị thu hồi",
                    imageUrl: null,
                    fileName: null,
                    fileSize: null,
                    fileType: null,
                    fileId: null,
                    timestamp: message.timestamp.toISOString(),
                });

                await mongoose.model("Message").deleteOne({ _id: messageId });
                console.log(`Message ${messageId} recalled and deleted by ${userId}`);
            } catch (error) {
                console.error("Error recalling message:", error);
            }
        });

        socket.on("edit-message", async ({ messageId, userId, groupId, newMessage }) => {
            if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            if (!newMessage || newMessage.trim() === "") {
                console.warn("Invalid new message");
                return;
            }

            try {
                const message = await mongoose.model("Message").findById(messageId);
                if (!message) {
                    console.warn(`Message ${messageId} not found`);
                    return;
                }

                if (message.senderId.toString() !== userId.toString()) {
                    console.warn(`User ${userId} not authorized to edit message ${messageId}`);
                    return;
                }

                if (message.isRecalled) {
                    console.warn(`Message ${messageId} is recalled, cannot edit`);
                    return;
                }

                message.message = newMessage;
                message.isEdited = true;
                await message.save();

                io.to(groupId).emit("message-edited", {
                    messageId,
                    groupId,
                    senderId: userId,
                    message: newMessage,
                    isEdited: true,
                    timestamp: message.timestamp.toISOString(),
                });

                console.log(`Message ${messageId} edited by ${userId}`);
            } catch (error) {
                console.error("Error editing message:", error);
            }
        });

        socket.on("delete-message", async ({ messageId, userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
                console.warn("Invalid IDs");
                return;
            }

            try {
                const message = await mongoose.model("Message").findById(messageId);
                if (!message) {
                    console.warn(`Message ${messageId} not found`);
                    return;
                }

                if (message.isRecalled) {
                    console.warn(`Message ${messageId} is recalled, cannot delete`);
                    return;
                }

                if (!message.deletedBy) message.deletedBy = [];
                if (!message.deletedBy.includes(userId)) {
                    message.deletedBy.push(userId);
                    await message.save();
                }

                const userSocketId = onlineUsers.get(userId);
                if (userSocketId) {
                    io.to(userSocketId).emit("message-deleted", {
                        messageId,
                        groupId,
                        onlyFor: userId,
                    });
                }

                console.log(`Message ${messageId} deleted for ${userId}`);
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        });

        socket.on("start-call", async (data, callback) => {
            const { groupId, userId, offer } = data;

            console.log(`start-call: Received request from user ${userId} for group ${groupId}`);

            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
                console.warn("start-call: Invalid IDs", { groupId, userId });
                return callback?.({ success: false, error: "ID người dùng hoặc nhóm không hợp lệ" });
            }

            if (!offer || !offer.type || !offer.sdp) {
                console.warn("start-call: Offer không hợp lệ", offer);
                return callback?.({ success: false, error: "Offer không hợp lệ" });
            }

            try {
                const group = await Group.findById(groupId).populate("members", "name");
                if (!group) {
                    console.warn(`start-call: Group ${groupId} not found`);
                    return callback?.({ success: false, error: "Nhóm không tồn tại" });
                }

                const memberIds = group.members.map(m => m._id.toString());
                if (!memberIds.includes(userId)) {
                    console.warn(`start-call: User ${userId} is not a member of group ${groupId}`);
                    return callback?.({ success: false, error: "Người dùng không thuộc nhóm" });
                }

                if (!activeCalls.has(groupId)) activeCalls.set(groupId, new Set());
                
                if (activeCalls.get(groupId).size > 0) {
                    console.log(`start-call: Cuộc gọi đã tồn tại trong group ${groupId}`);
                    return callback?.({ success: true, message: "Cuộc gọi đã tồn tại, tham gia ngay" });
                }

                activeCalls.get(groupId).add(userId);

                const user = await mongoose.model("User").findById(userId).select("name");
                if (!user) {
                    console.warn(`start-call: User ${userId} not found`);
                    return callback?.({ success: false, error: "Người dùng không tồn tại" });
                }

                console.log(`start-call: Gửi thông báo cuộc gọi đến nhóm ${groupId} bởi ${user.name}`);

                io.to(groupId).emit("call-notification", {
                    groupId,
                    userId,
                    userName: user.name,
                    message: `${user.name} đã bắt đầu một cuộc gọi video trong nhóm ${group.name}`,
                });

                io.to(groupId).emit("call-started", {
                    groupId,
                    userId,
                    userName: user.name,
                    offer,
                    members: group.members.map(member => ({
                        _id: member._id.toString(),
                        name: member.name,
                    })),
                });

                console.log(`start-call: Cuộc gọi khởi tạo thành công từ ${userId} trong nhóm ${groupId}`);
                callback?.({ success: true });
            } catch (err) {
                console.error("start-call: Error starting call:", err.message);
                callback?.({ success: false, error: "Lỗi server, vui lòng thử lại" });
            }
        });


        socket.on("call-answer", async ({ groupId, userId, answer, toUserId }) => {
            try {
                // Kiểm tra các ID hợp lệ
                if (
                    !mongoose.Types.ObjectId.isValid(userId) ||
                    !mongoose.Types.ObjectId.isValid(groupId) ||
                    !mongoose.Types.ObjectId.isValid(toUserId)
                ) {
                    console.warn("❌ call-answer: Invalid IDs", { groupId, userId, toUserId });
                    return;
                }

                // Kiểm tra answer hợp lệ
                if (!answer || answer.type !== "answer" || !answer.sdp) {
                    console.warn("❌ call-answer: Invalid WebRTC answer", answer);
                    return;
                }

                // Gửi answer cho peer mục tiêu
                const targetSocketId = onlineUsers.get(toUserId);
                if (!targetSocketId) {
                    console.warn(`⚠️ call-answer: Người nhận (userId=${toUserId}) đang offline`);
                    return;
                }

                io.to(targetSocketId).emit("call-answer", { groupId, userId, answer });
                console.log(`✅ call-answer: ${userId} -> ${toUserId} (group ${groupId})`);
            } catch (err) {
                console.error("❌ Lỗi xử lý call-answer:", err);
            }
        });

        socket.on("ice-candidate", ({ groupId, userId, candidate, toUserId }) => {
            if (
                !mongoose.Types.ObjectId.isValid(userId) ||
                !mongoose.Types.ObjectId.isValid(groupId) ||
                !mongoose.Types.ObjectId.isValid(toUserId)
            ) {
                console.warn("Invalid IDs");
                return;
            }

            // Nếu candidate là object nested như { type: 'candidate', candidate: { ... } }, thì unwrap
            const actualCandidate = (candidate?.type === "candidate" && candidate.candidate)
                ? candidate.candidate
                : candidate;

            if (!actualCandidate || !actualCandidate.candidate || actualCandidate.sdpMLineIndex == null || !actualCandidate.sdpMid) {
                console.warn("Invalid ICE candidate:", actualCandidate);
                return;
            }

            const targetSocket = onlineUsers.get(toUserId);
            if (targetSocket) {
                io.to(targetSocket).emit("ice-candidate", { groupId, userId, candidate: actualCandidate });
                console.log(`✅ ICE candidate sent from ${userId} to ${toUserId} in group ${groupId}`);
            }
        });

        socket.on("end-call", ({ groupId, userId }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            const groupCall = activeCalls.get(groupId);
            if (groupCall?.has(userId)) {
                groupCall.delete(userId);
                io.to(groupId).emit("call-ended", { groupId, userId });
                if (groupCall.size === 0) activeCalls.delete(groupId);
                console.log(`Call ended by ${userId} in group ${groupId}`);
            }
        });

        socket.on("start-screen-share", async ({ groupId, userId, offer }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
                console.warn("Invalid IDs");
                return;
            }

            if (!offer || !offer.type || !offer.sdp) {
                console.warn("Invalid WebRTC offer:", offer);
                return;
            }

            try {
                const group = await Group.findById(groupId);
                if (!group || !group.members.map(id => id.toString()).includes(userId)) {
                    console.warn(`User ${userId} not in group ${groupId}`);
                    return;
                }

                if (!screenShares.has(groupId)) screenShares.set(groupId, new Set());
                screenShares.get(groupId).add(userId);

                const user = await mongoose.model("User").findById(userId).select("name");
                if (!user) return;

                socket.to(groupId).emit("screen-share-started", {
                    groupId,
                    userId,
                    userName: user.name,
                    offer,
                });

                console.log(`Screen share started by ${userId} in group ${groupId}`);
            } catch (error) {
                console.error("Error starting screen share:", error);
            }
        });

        socket.on("stop-screen-share", ({ groupId, userId }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) return;

            const groupShare = screenShares.get(groupId);
            if (groupShare?.has(userId)) {
                groupShare.delete(userId);
                io.to(groupId).emit("screen-share-stopped", { groupId, userId });
                if (groupShare.size === 0) screenShares.delete(groupId);
                console.log(`Screen share stopped by ${userId} in group ${groupId}`);
            }
        });

        socket.on("file-transfer", ({ groupId, userId, fileName, fileSize, fileId }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) return;

            socket.to(groupId).emit("file-transfer", { groupId, userId, fileName, fileSize, fileId });
            console.log(`File transfer initiated by ${userId} in group ${groupId}`);
        });

        socket.on("file-data", ({ groupId, userId, toUserId, fileId, chunk }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(toUserId)) return;

            const targetSocket = onlineUsers.get(toUserId);
            if (targetSocket) {
                io.to(targetSocket).emit("file-data", { groupId, userId, fileId, chunk });
            }
        });

        socket.on("leave-group", async ({ userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            groupMembers.get(groupId)?.delete(userId);
            socket.leave(groupId);

            await notifyNewMember(groupId, userId, userId, true);

            activeCalls.get(groupId)?.delete(userId);
            if (activeCalls.get(groupId)?.size === 0) activeCalls.delete(groupId);
            io.to(groupId).emit("call-ended", { groupId, userId });

            screenShares.get(groupId)?.delete(userId);
            if (screenShares.get(groupId)?.size === 0) screenShares.delete(groupId);
            io.to(groupId).emit("screen-share-stopped", { groupId, userId });

            if (groupMembers.get(groupId)?.size === 0) groupMembers.delete(groupId);
            console.log(`User ${userId} left group ${groupId}`);
        });

        socket.on("get-call-status", async ({ groupId, userId }, callback) => {
            console.log(`get-call-status: Nhận yêu cầu từ người dùng ${userId} cho nhóm ${groupId}`);

            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
                console.warn("get-call-status: ID không hợp lệ", { groupId, userId });
                return callback?.({ success: false, error: "ID người dùng hoặc nhóm không hợp lệ" });
            }

            try {
                const group = await Group.findById(groupId).populate("members", "name email");
                if (!group) {
                    console.warn(`get-call-status: Nhóm ${groupId} không tồn tại`);
                    return callback?.({ success: false, error: "Nhóm không tồn tại" });
                }

                const memberIds = group.members.map(m => m?._id?.toString()).filter(Boolean);
                if (!memberIds.includes(userId)) {
                    console.warn(`get-call-status: Người dùng ${userId} không thuộc nhóm ${groupId}`);
                    return callback?.({ success: false, error: "Người dùng không thuộc nhóm" });
                }

                const isCallActive = activeCalls.has(groupId) && activeCalls.get(groupId).size > 0;
                const screenSharers = Array.from(screenShares.get(groupId) || []);

                callback?.({
                    success: true,
                    isCallActive,
                    participants: memberIds.map(id => ({
                        userId: id,
                        userName: group.members.find(m => m._id.toString() === id)?.name || "Không rõ",
                        isMicOff: false,
                        isCameraOff: false,
                    })),
                    isScreenShareActive: screenSharers.length > 0,
                    screenSharers: screenSharers.map(uid => ({ userId: uid })),
                });
            } catch (err) {
                console.error("get-call-status: Lỗi khi kiểm tra trạng thái:", err.message);
                callback?.({ success: false, error: "Lỗi server, vui lòng thử lại" });
            }
        });

        socket.on("ping-server", () => socket.emit("pong-server"));

        socket.on("disconnect", async () => {
            const userId = socketToUser.get(socket.id);
            if (!userId) return;

            onlineUsers.delete(userId);
            socketToUser.delete(socket.id);

            for (const [groupId, members] of groupMembers.entries()) {
                if (!members.has(userId)) continue;

                members.delete(userId);
                await notifyNewMember(groupId, userId, userId, true);

                activeCalls.get(groupId)?.delete(userId);
                if (activeCalls.get(groupId)?.size === 0) activeCalls.delete(groupId);
                io.to(groupId).emit("call-ended", { groupId, userId });

                screenShares.get(groupId)?.delete(userId);
                if (screenShares.get(groupId)?.size === 0) screenShares.delete(groupId);
                io.to(groupId).emit("screen-share-stopped", { groupId, userId });

                if (members.size === 0) groupMembers.delete(groupId);
            }

            io.emit("user-offline", userId);
            console.log(`User ${userId} disconnected`);
        });
    });
}

module.exports = {
    setupSocket,
    getIO,
    getSocketIdByUserId,
    isUserOnline,
    getGroupMembers,
    notifyNewMember,
    activeCalls,
    screenShares,
    fileTransfers,
    onlineUsers
};
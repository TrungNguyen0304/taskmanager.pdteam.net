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
        console.error(`ID nhóm không hợp lệ: ${groupId}`);
        return;
    }

    try {
        const group = await Group.findById(groupId).populate("members", "name").lean();
        if (!group) {
            console.error(`Nhóm không tồn tại: ${groupId}`);
            return;
        }

        io.to(groupId).emit("new-member", {
            groupId,
            memberName: memberName,
            isLeaving,
            group: {
                _id: group._id,
                name: group.name,
                members: group.members,
            },
        });

        console.log(`Thông báo ${isLeaving ? "rời" : "tham gia"} nhóm: ${memberName} (${groupId})`);
    } catch (error) {
        console.error(`Lỗi notifyNewMember (${groupId}, ${memberId}):`, error);
    }
}

function setupSocket(io) {
    ioInstance = io;
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("user-online", async (userId) => {
            if (!mongoose.Types.ObjectId.isValid(userId)) return;

            onlineUsers.set(userId, socket.id);
            socketToUser.set(socket.id, userId);
            socket.join(userId);

            console.log(`Người dùng ${userId} đang trực tuyến`);

            try {
                // 👉 Join tất cả các group mà user này là thành viên
                const groups = await Group.find({ members: userId }).select("_id");

                groups.forEach((group) => {
                    socket.join(group._id.toString());
                    console.log(`➡️ User ${userId} joined group room ${group._id}`);
                });

                io.emit("user-online", userId);
            } catch (err) {
                console.error("Lỗi khi join group room:", err);
            }
        });

        socket.on("user-logout", async (userId) => {
            if (!mongoose.Types.ObjectId.isValid(userId)) return;

            // Xóa người dùng khỏi danh sách online
            onlineUsers.delete(userId);
            socketToUser.delete(socket.id);

            // Xử lý rời các nhóm
            for (const [groupId, members] of groupMembers.entries()) {
                if (!members.has(userId)) continue;

                members.delete(userId);
                await notifyNewMember(groupId, userId, userId, true);

                // Xóa khỏi activeCalls
                activeCalls.get(groupId)?.delete(userId);
                if (activeCalls.get(groupId)?.size === 0) activeCalls.delete(groupId);
                io.to(groupId).emit("call-ended", { groupId, userId });

                // Xóa khỏi screenShares
                screenShares.get(groupId)?.delete(userId);
                if (screenShares.get(groupId)?.size === 0) screenShares.delete(groupId);
                io.to(groupId).emit("screen-share-stopped", { groupId, userId });

                // Xóa nhóm nếu không còn thành viên
                if (members.size === 0) groupMembers.delete(groupId);
            }

            // Thông báo người dùng offline
            io.emit("user-offline", userId);
            console.log(`Người dùng ${userId} đã đăng xuất và ngắt kết nối`);

            // Ngắt kết nối socket
            socket.disconnect(true);
        });

        socket.on("join-group", ({ userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            if (!groupMembers.has(groupId)) groupMembers.set(groupId, new Set());
            groupMembers.get(groupId).add(userId);
            socket.join(groupId);

            console.log(`Người dùng ${userId} đã tham gia nhóm ${groupId}`);
        });

        // socket.on("group-message", ({ userId, groupId, message }) => {
        //     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

        //     io.to(groupId).emit("group-message", {
        //         senderId: userId,
        //         groupId,
        //         message,
        //         timestamp: new Date().toISOString(),
        //     });
        // });

        // socket.on("group-image", ({ senderId, groupId, imageUrl, fileName, fileSize, fileType, timestamp }) => {
        //     if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

        //     io.to(groupId).emit("group-image", {
        //         senderId,
        //         groupId,
        //         imageUrl,
        //         fileName,
        //         fileSize,
        //         fileType,
        //         timestamp
        //     });
        // });

        socket.on("group-message", ({ _id, groupId, senderId, senderName, message, fileUrl, fileName, fileSize, fileType, fileId, timestamp }) => {
            if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            socket.to(groupId).emit("group-message", {
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
            if (
                !mongoose.Types.ObjectId.isValid(messageId) ||
                !mongoose.Types.ObjectId.isValid(userId) ||
                !mongoose.Types.ObjectId.isValid(groupId)
            ) {
                console.warn("ID không hợp lệ");
                return;
            }

            try {
                const message = await mongoose.model("Message").findById(messageId).populate("senderId", "name");
                if (!message) {
                    console.warn(`Tin nhắn ${messageId} không tồn tại`);
                    return;
                }

                if (message.senderId._id.toString() !== userId.toString()) {
                    console.warn(`Người dùng ${userId} không có quyền thu hồi tin nhắn ${messageId}`);
                    return;
                }

                // Gửi socket thông báo đã thu hồi (trước khi xóa)
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

                // XÓA HẲN tin nhắn khỏi MongoDB
                await mongoose.model("Message").deleteOne({ _id: messageId });

                console.log(`Tin nhắn ${messageId} đã bị thu hồi và XÓA KHỎI DB bởi ${userId}`);
            } catch (error) {
                console.error("Lỗi khi thu hồi và xóa tin nhắn:", error);
            }
        });


        socket.on("edit-message", async ({ messageId, userId, groupId, newMessage }) => {
            if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            if (!newMessage || newMessage.trim() === "") {
                console.warn("Tin nhắn mới không hợp lệ");
                return;
            }

            try {
                const message = await mongoose.model("Message").findById(messageId);
                if (!message) {
                    console.warn(`Tin nhắn ${messageId} không tồn tại`);
                    return;
                }

                if (message.senderId.toString() !== userId.toString()) {
                    console.warn(`Người dùng ${userId} không có quyền chỉnh sửa tin nhắn ${messageId}`);
                    return;
                }

                if (message.isRecalled) {
                    console.warn(`Tin nhắn ${messageId} đã bị thu hồi, không thể chỉnh sửa`);
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

                console.log(`Tin nhắn ${messageId} đã được chỉnh sửa bởi ${userId}`);
            } catch (error) {
                console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
            }
        });

        socket.on("delete-message", async ({ messageId, userId, groupId }) => {
            if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) {
                console.warn("ID không hợp lệ");
                return;
            }

            try {
                const message = await Message.findById(messageId);
                if (!message) {
                    console.warn(`Tin nhắn ${messageId} không tồn tại`);
                    return;
                }

                if (message.isRecalled) {
                    console.warn(`Tin nhắn ${messageId} đã bị thu hồi, không thể xóa`);
                    return;
                }

                if (!message.deletedBy) message.deletedBy = [];
                if (!message.deletedBy.includes(userId)) {
                    message.deletedBy.push(userId);
                    await message.save();
                }

                const userSocketId = onlineUsers.get(userId); // socket.id của người gửi
                if (userSocketId) {
                    io.to(userSocketId).emit("message-deleted", {
                        messageId,
                        groupId,
                        onlyFor: userId, // gợi ý: giúp frontend xử lý xóa cục bộ
                    });
                }

                console.log(`Tin nhắn ${messageId} được xóa bởi ${userId} (chỉ cho chính họ)`);
            } catch (error) {
                console.error("Lỗi khi xóa tin nhắn:", error);
            }
        });


        socket.on("start-call", async ({ groupId, userId, offer }) => {
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(groupId)) return;

            if (!offer || !offer.type || !offer.sdp) {
                console.warn("❌ Không nhận được offer hợp lệ:", offer);
                return;
            }

            try {
                if (!activeCalls.has(groupId)) activeCalls.set(groupId, new Set());
                activeCalls.get(groupId).add(userId);

                const user = await mongoose.model("User").findById(userId).select("name");
                if (!user) return;

                socket.to(groupId).emit("call-started", {
                    groupId,
                    userId,
                    userName: user.name,
                    offer,
                });
            } catch (err) {
                console.error("Lỗi start-call:", err);
            }
        });

        socket.on("call-answer", ({ groupId, userId, answer, toUserId }) => {
            const targetSocket = onlineUsers.get(toUserId);
            if (targetSocket) {
                io.to(targetSocket).emit("call-answer", { groupId, userId, answer });
            }
        });

        socket.on("ice-candidate", ({ groupId, userId, candidate, toUserId }) => {
            const targetSocket = onlineUsers.get(toUserId);
            if (targetSocket) {
                io.to(targetSocket).emit("ice-candidate", { groupId, userId, candidate });
            }
        });

        socket.on("end-call", ({ groupId, userId }) => {
            const groupCall = activeCalls.get(groupId);
            if (groupCall?.has(userId)) {
                groupCall.delete(userId);
                io.to(groupId).emit("call-ended", { groupId, userId });
                if (groupCall.size === 0) activeCalls.delete(groupId);
            }
        });

        socket.on("start-screen-share", async ({ groupId, userId, offer }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) return;

            if (!offer) {
                console.warn("🛑 Không có offer để chia sẻ màn hình từ:", userId);
                return;
            }

            try {
                if (!screenShares.has(groupId)) screenShares.set(groupId, new Set());
                screenShares.get(groupId).add(userId);

                const user = await mongoose.model("User").findById(userId).select("name");
                if (!user) return;

                io.to(groupId).emit("screen-share-started", {
                    groupId,
                    userId,
                    userName: user.name,
                    offer,
                });
            } catch (error) {
                console.error("Lỗi start-screen-share:", error);
            }
        });

        socket.on("stop-screen-share", ({ groupId, userId }) => {
            const groupShare = screenShares.get(groupId);
            if (groupShare?.has(userId)) {
                groupShare.delete(userId);
                io.to(groupId).emit("screen-share-stopped", { groupId, userId });
                if (groupShare.size === 0) screenShares.delete(groupId);
            }
        });

        socket.on("file-transfer", ({ groupId, userId, fileName, fileSize, fileId }) => {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) return;

            socket.to(groupId).emit("file-transfer", { groupId, userId, fileName, fileSize, fileId });
        });

        socket.on("file-data", ({ groupId, userId, toUserId, fileId, chunk }) => {
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
            console.log(`Người dùng ${userId} đã ngắt kết nối`);
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
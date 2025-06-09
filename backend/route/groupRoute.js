const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    addMember,
    getGroupMessages,
    sendGroupMessage,
    removeMember,
    leaveGroup,
    startCall,
    getCallStatus,
    startScreenShare,
    startFileTransfer,
    sendImageMessage
} = require('../controller/group');
const authenticateJWT = require('../middleware/auth.js');
const upload = require('../middleware/upload.js')


// Tạo nhóm mới
router.post('/create', authenticateJWT, createGroup);

// Lấy danh sách nhóm
router.get('/', authenticateJWT, getGroups);


// Thêm thành viên vào nhóm
router.post('/:groupId/members', authenticateJWT, addMember);

// Lấy lịch sử tin nhắn nhóm
router.get('/:groupId/messages', authenticateJWT, getGroupMessages);

// Gửi tin nhắn nhóm
router.post('/:groupId/messages', authenticateJWT, sendGroupMessage);

//  xóa một thành viên
router.delete("/:groupId/members/:userId", authenticateJWT, removeMember);

//rời khỏi nhóm
router.delete("/:groupId/leave", authenticateJWT, leaveGroup);

// Khởi tạo cuộc gọi video
router.post('/:groupId/call', authenticateJWT, startCall);

// Lấy trạng thái cuộc gọi và chia sẻ màn hình
router.get('/:groupId/call-status', authenticateJWT, getCallStatus);

// Khởi tạo chia sẻ màn hình
router.post('/:groupId/screen-share', authenticateJWT, startScreenShare);

// Khởi tạo truyền file P2P
router.post('/:groupId/file-transfer', authenticateJWT, startFileTransfer);

// gửi ảnh 
router.post('/:groupId/sendImageMessage',upload.single("image"), authenticateJWT, sendImageMessage);


module.exports = router;
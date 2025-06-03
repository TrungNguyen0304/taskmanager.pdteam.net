const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require('../controller/notification');
const authenticateJWT = require('../middleware/auth.js');

// Lấy danh sách thông báo của user
router.get('/:userId', authenticateJWT, getNotifications);

// Đánh dấu thông báo đã đọc
router.patch('/:id/read', authenticateJWT, markNotificationAsRead);

// Xóa thông báo
router.delete('/:id', authenticateJWT, deleteNotification);

module.exports = router;
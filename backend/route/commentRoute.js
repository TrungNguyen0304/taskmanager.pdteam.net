const express = require('express');
const router = express.Router();
const {
  commentOnReport,
  getCommentsByReportId,
  deleteComment,
  updateComment,
  markCommentAsRead
 
} = require('../controller/comment.js');
const authenticateJWT = require('../middleware/auth.js');

// gửi comment
router.post('/reports/:id/appcomment', authenticateJWT, commentOnReport);

// xem bình luận theo id
router.get('/reports/:id/getcomment', authenticateJWT, getCommentsByReportId);

// xóa comment
router.delete('/reports/:id/delete', authenticateJWT, deleteComment);

// sửa comment
router.put('/reports/:id/update', authenticateJWT, updateComment);

router.patch('/reports/:id/read', authenticateJWT, markCommentAsRead);


module.exports = router;
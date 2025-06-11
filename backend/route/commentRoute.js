const express = require('express');
const router = express.Router();
const {
  commentOnReport,
  getCommentsByReportId,
  deleteComment,
  updateComment
 
} = require('../controller/comment.js');
const authenticateJWT = require('../middleware/auth.js');


router.post('/reports/:id/appcomment', authenticateJWT, commentOnReport);

router.get('/reports/:id/getcomment', authenticateJWT, getCommentsByReportId);

router.delete('/reports/:id/delete', authenticateJWT, deleteComment);

router.put('/reports/:id/update', authenticateJWT, updateComment);



module.exports = router;
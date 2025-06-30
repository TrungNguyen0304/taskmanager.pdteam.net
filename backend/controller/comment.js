const mongoose = require("mongoose");
const Comment = require('../models/comment');
const Report = require('../models/report');
const { notifyComment } = require('../controller/notification');

const commentOnReport = async (req, res) => {
  try {
    const { id } = req.params; // ID của report
    const { comment: content, toRole: rawToRole } = req.body;
    const { _id: userId, role: fromRole, name } = req.user;

    // Chuẩn hóa vai trò người gửi
    const userRole = (fromRole || '').trim().toLowerCase();

    // Tự động chọn toRole nếu client không gửi
    let toRole = (rawToRole || '').trim().toLowerCase();
    if (!toRole) {
      if (userRole === 'member') toRole = 'leader';
      else if (userRole === 'leader') toRole = 'company';
      else if (userRole === 'company') toRole = 'leader'; // fallback
    }

    // Ghi log để kiểm tra giá trị
    console.log("📤 Vai trò người gửi (from):", userRole);
    console.log("📥 Vai trò người nhận (to):", toRole);

    // Kiểm tra hợp lệ vai trò người nhận
    const validRoles = ['company', 'leader', 'member'];
    if (!validRoles.includes(toRole)) {
      return res.status(400).json({ message: 'Vai trò người nhận không hợp lệ.' });
    }

    // Lấy báo cáo và nhóm
    const report = await Report.findById(id).populate('team');
    if (!report) {
      return res.status(404).json({ message: 'Báo cáo không tồn tại.' });
    }

    // Kiểm tra quyền bình luận theo vai trò
    if (userRole === 'leader') {
      const isAssignedLeader = report.team?.assignedLeader?.toString() === userId.toString();
      if (!isAssignedLeader) {
        return res.status(403).json({ message: 'Không có quyền bình luận.' });
      }
    } else if (userRole === 'member') {
      const isAssigned = report.assignedMembers?.map(m => m.toString()).includes(userId.toString());
      if (!isAssigned) {
        return res.status(403).json({ message: 'Không có quyền bình luận.' });
      }
    }

    // Tạo bình luận mới
    const newComment = new Comment({
      report: id,
      comment: content,
      from: userRole,
      to: toRole,
      creator: userId,
      isReadBy: [userId], // người tạo xem rồi
    });

    await newComment.save();
    await newComment.populate({ path: 'creator', select: 'name' });

    // Cập nhật bình luận vào báo cáo
    report.comments.push(newComment._id);
    await report.save();

    // Gửi thông báo
    try {
      await notifyComment({
        comment: newComment,
        report,
        creator: { _id: userId, name },
      });
    } catch (notificationError) {
      console.error('⚠️ Lỗi gửi thông báo:', notificationError.message);
    }

    res.status(201).json({
      message: 'Bình luận thành công.',
      comment: newComment,
    });
  } catch (err) {
    console.error('❌ commentOnReport error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};


const getCommentsByReportId = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Fetch comments for the report
        const comments = await Comment.find({ report: id })
            .populate({ path: 'creator', select: 'name' })
            .sort({ createdAt: -1 });

        // If no comments, return empty response with unreadCount 0
        if (!comments || comments.length === 0) {
            return res.status(200).json({
                message: 'Chưa có bình luận nào.',
                comments: [],
                unreadCount: 0,
            });
        }

        // Map comments to include isRead status
        const commentsWithReadStatus = comments.map((c) => {
            const isRead = c.isReadBy?.some((uid) => uid.toString() === userId.toString());
            return {
                ...c.toObject(),
                isRead,
            };
        });

        // Calculate unread comments count
        const unreadCount = commentsWithReadStatus.filter((c) => !c.isRead).length;

        res.status(200).json({
            message: 'Lấy bình luận thành công.',
            comments: commentsWithReadStatus,
            unreadCount,
        });
    } catch (error) {
        console.error('getCommentsByReportId error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params; // ID của comment
        const { _id: userId } = req.user;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        // Kiểm tra quyền: chỉ người tạo mới được xóa
        if (!comment.creator || comment.creator.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này.' });
        }

        // Xóa khỏi mảng comments trong Report
        await Report.findByIdAndUpdate(comment.report, {
            $pull: { comments: comment._id }
        });

        await comment.deleteOne();

        res.status(200).json({ message: 'Xóa bình luận thành công.' });
    } catch (error) {
        console.error('deleteComment error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params; // ID của comment
        const { comment: newComment } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        // Kiểm tra quyền sửa bình luận
        if (comment.creator.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bình luận này.' });
        }

        // Cập nhật nội dung
        comment.comment = newComment;
        await comment.save();

        // Populate tên người bình luận
        await comment.populate({ path: 'creator', select: 'name' });

        res.status(200).json({
            message: 'Cập nhật bình luận thành công.',
            comment
        });
    } catch (error) {
        console.error('updateComment error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const markCommentAsRead = async (req, res) => {
    try {
        const { id } = req.params; // comment ID
        const userId = req.user._id;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        // Nếu user chưa đọc, thì thêm vào danh sách đã đọc
        if (!comment.isReadBy.includes(userId)) {
            comment.isReadBy.push(userId);
            await comment.save();
        }

        res.status(200).json({ message: 'Đã đánh dấu là đã đọc.' });
    } catch (error) {
        console.error('markCommentAsRead error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    commentOnReport,
    getCommentsByReportId,
    updateComment,
    deleteComment,
    markCommentAsRead
};
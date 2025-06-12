const mongoose = require("mongoose");
const Comment = require('../models/comment');
const Report = require('../models/report');

const commentOnReport = async (req, res) => {
    try {
        const { id } = req.params; // report ID
        const { comment, toRole } = req.body; // nội dung và vai trò nhận
        const { _id: userId, role: fromRole } = req.user;

        // Lấy report và team
        const report = await Report.findById(id).populate('team');
        if (!report) return res.status(404).json({ message: 'Báo cáo không tồn tại.' });

        // Kiểm tra quyền
        if (fromRole === 'Leader') {
            const isAssignedLeader = report.team.assignedLeader.toString() === userId.toString();
            if (!isAssignedLeader) return res.status(403).json({ message: 'Không có quyền bình luận.' });
        } else if (fromRole === 'Member') {
            const isAssigned = report.assignedMembers.map(m => m.toString()).includes(userId.toString());
            if (!isAssigned) return res.status(403).json({ message: 'Không có quyền bình luận.' });
        }

        // Tạo comment
        const newComment = new Comment({
            report: id,
            comment,
            from: fromRole,
            to: toRole,
            creator: userId
        });

        await newComment.save();

        // Populate creator để trả về thông tin người bình luận
        await newComment.populate({ path: 'creator', select: 'name' });

        // Cập nhật vào report
        report.comments.push(newComment._id);
        await report.save();

        res.status(201).json({ message: 'Bình luận thành công.', comment: newComment });

    } catch (err) {
        console.error('commentOnReport error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

const getCommentsByReportId = async (req, res) => {
    try {
        const { id } = req.params;

        const comments = await Comment.find({ report: id })
            .populate({ path: 'creator', select: 'name' })
            .sort({ createdAt: -1 });

        if (comments.length === 0) {
            return res.status(200).json({
                message: 'Chưa có bình luận nào.',
                comments: []
            });
        }

        res.status(200).json({ message: 'Lấy bình luận thành công.', comments });
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

module.exports = {
    commentOnReport,
    getCommentsByReportId,
    updateComment,
    deleteComment
};

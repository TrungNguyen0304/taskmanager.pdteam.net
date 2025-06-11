import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader, LucidePencilLine, X, MoreVertical } from "lucide-react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

const CommentModal = ({ reportId, isOpen, onClose, onCommentUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reportId) {
      fetchComments();
      setVisibleCommentsCount(5);
    }
  }, [isOpen, reportId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8001/api/comment/reports/${reportId}/getcomment`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      setComments([]);
      alert(
        error.response?.data?.message ||
          "Không thể tải bình luận. Vui lòng thử lại."
      );
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `http://localhost:8001/api/comment/reports/${reportId}/appcomment`,
        {
          comment: newComment,
          toRole: "leader",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchComments();
      onCommentUpdate(reportId, comments.length + 1);
      setNewComment("");
      setVisibleCommentsCount(5);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể gửi bình luận. Vui lòng thử lại."
      );
      console.error("Post comment error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.comment);
    setMenuOpen(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim()) {
      alert("Bình luận không được để trống.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8001/api/comment/reports/${commentId}/update`,
        {
          comment: editCommentText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchComments();
      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể cập nhật bình luận. Vui lòng thử lại."
      );
      console.error("Update comment error:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `http://localhost:8001/api/comment/reports/${commentToDelete}/delete`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchComments();
      onCommentUpdate(reportId, comments.length - 1);
      setMenuOpen(null);
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa bình luận. Vui lòng thử lại."
      );
      console.error("Delete comment error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteComment = () => {
    setDeleteConfirmOpen(false);
    setCommentToDelete(null);
  };

  const handleViewMore = () => {
    setVisibleCommentsCount(comments.length);
  };

  const handleShowLess = () => {
    setVisibleCommentsCount(5);
  };

  const toggleMenu = (commentId) => {
    setMenuOpen(menuOpen === commentId ? null : commentId);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMs = now - commentDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays <= 10) {
      return `${diffInDays} ngày trước`;
    } else {
      return commentDate.toLocaleString("vi-VN");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Bình luận
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <>
              {comments.slice(0, visibleCommentsCount).map((comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-50 rounded-xl p-4 text-sm sm:text-base shadow-sm border relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.creator?.name || "Ẩn danh"} ({comment.from})
                    </span>
                    {comment.from !== "member" && (
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(comment._id)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {menuOpen === comment._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                            >
                              <LucidePencilLine className="w-4 h-4" />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                            >
                              <MdDelete className="w-4 h-4" />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {editingComment === comment._id ? (
                    <div className="mb-3">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Chỉnh sửa bình luận..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm transition-colors duration-200"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment._id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 mb-2">{comment.comment}</p>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              ))}
              <div className="text-start">
                {comments.length > visibleCommentsCount && (
                  <button
                    onClick={handleViewMore}
                    className="flex items-center font-semibold text-blue-600 hover:text-blue-800 text-sm sm:text-base transition-colors duration-200"
                  >
                    Xem thêm
                    <FaAngleDown className="ml-1 w-4 h-4" />
                  </button>
                )}
                {visibleCommentsCount === comments.length &&
                  comments.length > 5 && (
                    <button
                      onClick={handleShowLess}
                      className="flex items-center font-semibold text-blue-600 hover:text-blue-800 text-sm sm:text-base transition-colors duration-200"
                    >
                      Ẩn bớt
                      <FaAngleUp className="ml-1 w-4 h-4" />
                    </button>
                  )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              Chưa có bình luận nào.
            </p>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập bình luận..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
            />
            <button
              onClick={handleCommentSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors duration-200"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa bình luận này?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDeleteComment}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Loading Overlay */}
      {deleteLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70">
          <Loader className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CommentModal;

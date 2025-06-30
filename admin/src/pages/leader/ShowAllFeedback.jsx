import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, AlertCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 3;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ShowAllFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/leader/showAllFeedback",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const formatted = response.data.feedbacks.map((feedback, index) => ({
          id: feedback.feedbackId || `feedback-${index}`,
          content: feedback.comment || "N/A",
          rating: feedback.score || 0,
          createdBy: feedback.team?.leaderName || "N/A",
          createdAt: feedback.createdAt
            ? formatDate(feedback.createdAt)
            : "N/A",
          teamName: feedback.team?.teamName || "N/A",
          reportContent: feedback.report?.content || "N/A",
        }));
        setFeedbacks(formatted);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải danh sách đánh giá."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const totalPages = Math.ceil(feedbacks.length / PAGE_SIZE);
  const paginatedFeedbacks = feedbacks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-md sm:text-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Quay lại
        </button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
          Đánh Giá Từ Công Ty
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center text-sm sm:text-base py-8">
          Đang tải dữ liệu...
        </p>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="w-10 h-10 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800 font-medium text-md sm:text-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Quay lại
          </button>
        </div>
      ) : paginatedFeedbacks.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            Không có đánh giá nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {paginatedFeedbacks.map((feedback, index) => (
            <div
              key={feedback.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">
                    #{(currentPage - 1) * PAGE_SIZE + index + 1}
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Nhóm:</span>{" "}
                    {feedback.teamName}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Nội dung báo cáo:</span>{" "}
                    {feedback.reportContent}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Nội dung đã được đánh giá:</span>{" "}
                    {feedback.content}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Điểm đánh giá:</span>{" "}
                    <span className="text-blue-600 font-semibold">
                      {feedback.rating}/10
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Quản lý dự án:</span>{" "}
                    {feedback.createdBy}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Ngày đánh giá:</span>{" "}
                    {feedback.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end mt-6 sm:mt-8 gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`w-10 h-10 sm:w-12 sm:h-12 border rounded-lg font-medium text-sm sm:text-base transition-colors ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowAllFeedback;

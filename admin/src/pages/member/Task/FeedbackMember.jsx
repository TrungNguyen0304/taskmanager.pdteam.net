import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Star } from "lucide-react";
import axios from "axios";

const PAGE_SIZE = 3;

const FeedbackMember = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/member/showAllFeedback",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.feedbacks)) {
          const formatted = response.data.feedbacks.map((feedback, index) => ({
            id: feedback.feedbackId || `feedback-${index}`,
            content: feedback.comment || "N/A",
            rating: feedback.score || 0,
            createdBy: feedback.from || "N/A",
            createdAt: feedback.createdAt
              ? new Date(feedback.createdAt).toLocaleString("vi-VN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "N/A",
            taskId: feedback.task?.taskId || "N/A",
            taskName: feedback.task?.taskName || "N/A",
            reportId: feedback.report?.reportId || "N/A",
            reportContent: feedback.report?.content || "N/A",
          }));
          setFeedbacks(formatted);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đánh giá:", error);
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
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/feedback-detail/${id}`);
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <h2 className="text-xl md:text-3xl font-bold text-blue-600">
          Đánh Giá Từ Leader
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Đang tải dữ liệu...</p>
      ) : paginatedFeedbacks.length === 0 ? (
        <p className="text-gray-500 text-center">Không có đánh giá nào.</p>
      ) : (
        <div className="space-y-5">
          {paginatedFeedbacks.map((feedback, index) => (
            <div
              key={feedback.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    #{(currentPage - 1) * PAGE_SIZE + index + 1}
                  </div>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Nhiệm vụ:</span>{" "}
                    {feedback.taskName}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Báo cáo:</span>{" "}
                    {feedback.reportContent}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Nội dung đánh giá:</span>{" "}
                    {feedback.content}
                  </p>
                  <p className="text-gray-700 mb-1 flex items-center gap-1">
                    <span className="font-semibold">Điểm đánh giá:</span>{" "}
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill={i < feedback.rating ? "#facc15" : "none"}
                      />
                    ))}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Người đánh giá:</span>{" "}
                    {feedback.createdBy}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Ngày đánh giá:</span>{" "}
                    {feedback.createdAt}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleView(feedback.id)}
                    className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end mt-8 gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`w-10 h-10 border font-semibold rounded-lg transition ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackMember;

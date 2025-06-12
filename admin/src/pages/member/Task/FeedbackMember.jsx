import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
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

  return (
    <div className="w-full mx-auto bg-white p-0 md:p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Quay lại
        </button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
          Đánh Giá Từ Leader
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center text-sm sm:text-base py-8">
          Đang tải dữ liệu...
        </p>
      ) : paginatedFeedbacks.length === 0 ? (
        <p className="text-gray-500 text-center text-sm sm:text-base py-8">
          Không có đánh giá nào.
        </p>
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
                    <span className="font-semibold">Nhiệm vụ:</span>{" "}
                    {feedback.taskName}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Báo cáo:</span>{" "}
                    {feedback.reportContent}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Nội dung đánh giá:</span>{" "}
                    {feedback.content}
                  </p>
                  <div className="text-gray-700 text-sm sm:text-base flex items-center gap-1">
                    <span className="font-semibold">Điểm đánh giá:</span>{" "}
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < feedback.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill={i < feedback.rating ? "#facc15" : "none"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">Người đánh giá:</span>{" "}
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
        </div>
      )}
    </div>
  );
};

export default FeedbackMember;
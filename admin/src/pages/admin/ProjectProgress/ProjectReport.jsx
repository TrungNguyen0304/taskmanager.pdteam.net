import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  Users,
  Clock,
  AlertCircle,
  MessageCircle,
  X,
} from "lucide-react";
import axios from "axios";
import CommentModal from "./CommentModal";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ProjectReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [isSelectReportModalOpen, setIsSelectReportModalOpen] = useState(false);
  const [evaluateReportId, setEvaluateReportId] = useState(null);
  const [comment, setComment] = useState("");
  const [score, setScore] = useState("");
  const [evaluateError, setEvaluateError] = useState(null);
  const reportsPerPage = 2;

  useEffect(() => {
    const fetchProjectReports = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/company/showAllRoprtProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const reportsWithCommentData = await Promise.all(
          response.data.project.reports.map(async (report) => {
            try {
              const commentResponse = await axios.get(
                `http://localhost:8001/api/comment/reports/${report._id}/getcomment`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return {
                ...report,
                commentCount: commentResponse.data.comments.length,
                unreadCommentCount: commentResponse.data.unreadCount || 0,
              };
            } catch (err) {
              return { ...report, commentCount: 0, unreadCommentCount: 0 };
            }
          })
        );
        setProjectData({
          ...response.data.project,
          reports: reportsWithCommentData,
        });
        setError(null);
        window.scrollTo(0, 0);
      } catch (err) {
        setError(err.response?.data?.message || "Chưa có báo cáo nào");
        setProjectData(null);
      }
    };

    fetchProjectReports();
  }, [id]);

  const handleCommentUpdate = (reportId, commentCount) => {
    setProjectData((prev) => ({
      ...prev,
      reports: prev.reports.map((report) =>
        report._id === reportId
          ? { ...report, commentCount, unreadCommentCount: 0 }
          : report
      ),
    }));
  };

  const handleOpenCommentModal = (reportId) => {
    setSelectedReportId(reportId);
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedReportId(null);
    const fetchProjectReports = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/company/showAllRoprtProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const reportsWithCommentData = await Promise.all(
          response.data.project.reports.map(async (report) => {
            try {
              const commentResponse = await axios.get(
                `http://localhost:8001/api/comment/reports/${report._id}/getcomment`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return {
                ...report,
                commentCount: commentResponse.data.comments.length,
                unreadCommentCount: commentResponse.data.unreadCount || 0,
              };
            } catch (err) {
              return { ...report, commentCount: 0, unreadCommentCount: 0 };
            }
          })
        );
        setProjectData({
          ...response.data.project,
          reports: reportsWithCommentData,
        });
      } catch (err) {
        console.error("Error refetching project reports:", err);
      }
    };
    fetchProjectReports();
  };

  const handleOpenSelectReportModal = () => {
    setIsSelectReportModalOpen(true);
  };

  const handleCloseSelectReportModal = () => {
    setIsSelectReportModalOpen(false);
  };

  const handleSelectReport = (reportId) => {
    setEvaluateReportId(reportId);
    setIsSelectReportModalOpen(false);  
    setIsEvaluateModalOpen(true);
    setComment("");
    setScore("");
    setEvaluateError(null);
  };

  const safeProgress = (progress) => {
    return Math.min(Math.max(progress || 0, 0), 100);
  };

  const getProgressColor = (progress) => {
    const value = safeProgress(progress);
    if (value >= 75) return "bg-green-500"; // High progress
    if (value >= 50) return "bg-blue-500"; // Medium progress
    if (value >= 25) return "bg-yellow-500"; // Low progress
    return "bg-red-500"; // Very low or no progress
  };

  const handleCloseEvaluateModal = () => {
    setIsEvaluateModalOpen(false);
    setEvaluateReportId(null);
    setComment("");
    setScore("");
    setEvaluateError(null);
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8001/api/company/evaluateLeaderReport/${evaluateReportId}`,
        { comment, score: parseFloat(score) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjectData((prev) => ({
        ...prev,
        reports: prev.reports.map((report) =>
          report._id === evaluateReportId
            ? { ...report, feedback: response.data.feedback._id }
            : report
        ),
      }));
      handleCloseEvaluateModal();
      alert("Đánh giá báo cáo thành công!");
    } catch (err) {
      setEvaluateError(
        err.response?.data?.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại."
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <p className="text-blue-700 text-xl font-semibold mb-8 font-sans">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold font-sans transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label="Quay lại trang trước"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-xl font-medium font-sans">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const totalReports = projectData.reports.length;
  const totalPages = Math.ceil(totalReports / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = projectData.reports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const onPageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-sans"
          aria-label="Quay lại trang trước"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-base">Quay lại</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 md:p-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-sans">
            Báo Cáo Dự Án: {projectData.project.name}
          </h1>
          <p className="text-blue-100 mt-3 text-base md:text-lg font-sans">
            {projectData.project.description ||
              "Tổng quan và báo cáo chi tiết của dự án"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 font-sans">
                <Folder className="w-6 h-6 text-blue-600" />
                Thông Tin Tổng Quan
              </h3>
              <div className="space-y-6 text-base">
                <div>
                  <span className="text-gray-600 font-medium block mb-2 font-sans">
                    Tên dự án:
                  </span>
                  <p className="text-gray-900 font-semibold text-lg font-sans">
                    {projectData.project.name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-2 font-sans">
                    Mô tả:
                  </span>
                  <p className="text-gray-700 font-sans leading-relaxed">
                    {projectData.project.description || "Không có mô tả"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-2 font-sans">
                    Đội nhóm:
                  </span>
                  <p className="text-gray-900 font-semibold text-lg font-sans">
                    {projectData.reports[0]?.team?.name || "Chưa chỉ định"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-2 font-sans">
                    Quản lý:
                  </span>
                  <p className="text-gray-900 font-semibold text-lg font-sans">
                    {projectData.reports[0]?.assignedLeader?.name ||
                      "Chưa chỉ định"}
                  </p>
                  <p className="text-gray-600 text-sm font-sans">
                    {projectData.reports[0]?.assignedLeader?.email || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 font-sans">
                <Users className="w-6 h-6 text-blue-600" />
                Báo Cáo Chi Tiết
              </h3>
              {currentReports.length ? (
                currentReports.map((report) => (
                  <div
                    key={report._id}
                    className="p-5 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm relative"
                  >
                    <button
                      onClick={() => handleSelectReport(report._id)}
                      className={`absolute top-4 right-4 px-5 py-2 rounded-full font-semibold font-sans text-sm transition-all duration-300 shadow-md hover:shadow-lg ${report.feedback
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      disabled={report.feedback}
                      aria-label={
                        report.feedback
                          ? "Báo cáo đã được đánh giá"
                          : `Đánh giá báo cáo ${formatDate(report.createdAt)}`
                      }
                    >
                      {report.feedback
                        ? "Đã đánh giá báo cáo"
                        : "Đánh giá báo cáo"}
                    </button>
                    <div className="space-y-5">
                      <div>
                        <span className="text-gray-600 font-medium block mb-2 font-sans">
                          Nội dung báo cáo:
                        </span>
                        <p className="text-gray-900 font-sans leading-relaxed">
                          {report.content}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium block mb-2 font-sans">
                          Khó khăn:
                        </span>
                        <p className="text-gray-900 font-sans leading-relaxed">
                          {report.difficulties ||
                            "Không có khó khăn được báo cáo"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium block mb-2 font-sans">
                          Tiến độ:
                        </span>
                        <div className="relative h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                              report.projectProgress
                            )}`}
                            style={{ width: `${safeProgress(report.projectProgress)}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-900 font-sans leading-relaxed mt-2 text-center text-sm sm:text-base">
                          {safeProgress(report.projectProgress)}%
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-medium font-sans">
                          File đính kèm:
                        </span>
                        <p className="text-gray-900 font-sans">
                          {report.file ? (
                            <a
                              href={report.file}
                              className="text-blue-600 hover:underline font-medium"
                              download
                              rel="noopener noreferrer"
                            >
                              Tải xuống file
                            </a>
                          ) : (
                            "Không có file đính kèm"
                          )}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:text-blue-700 transition-colors duration-200"
                        onClick={() => handleOpenCommentModal(report._id)}
                        role="button"
                        aria-label={`Mở bình luận cho báo cáo ${report._id}`}
                      >
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-600 font-medium font-sans hover:text-blue-600">
                          Bình luận ({report.commentCount || 0}
                          {report.unreadCommentCount > 0 && (
                            <span className="text-red-600 font-semibold ml-1">
                              +{report.unreadCommentCount} mới
                            </span>
                          )}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-600 font-medium font-sans">
                          Thời gian tạo:
                        </span>
                        <p className="text-gray-900 font-sans">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                      {report.feedback && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 font-medium font-sans">
                            Trạng thái:
                          </span>
                          <p className="text-green-600 font-semibold font-sans">
                            Đã đánh giá
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                  <p className="text-xl font-medium font-sans">
                    Không có báo cáo nào để hiển thị
                  </p>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200 font-sans"
                      aria-label="Trang trước"
                    >
                      Trước
                    </button>
                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 font-sans ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200 font-sans"
                      aria-label="Trang sau"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isCommentModalOpen && (
        <CommentModal
          reportId={selectedReportId}
          isOpen={isCommentModalOpen}
          onClose={handleCloseCommentModal}
          onCommentUpdate={handleCommentUpdate}
        />
      )}
      {isSelectReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 font-sans">
                Chọn báo cáo để đánh giá
              </h2>
              <button
                onClick={handleCloseSelectReportModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Đóng modal chọn báo cáo"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {projectData.reports.length ? (
                projectData.reports.map((report) => (
                  <button
                    key={report._id}
                    onClick={() => handleSelectReport(report._id)}
                    disabled={report.feedback}
                    className={`w-full text-left p-4 rounded-lg font-sans transition-all duration-200 ${report.feedback
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md"
                      }`}
                    aria-label={`Chọn báo cáo từ ngày ${formatDate(
                      report.createdAt
                    )}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Báo cáo {formatDate(report.createdAt)}
                      </span>
                      {report.feedback && (
                        <span className="text-sm text-green-600 font-semibold">
                          Đã đánh giá
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {report.content}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-gray-600 font-sans text-center text-lg">
                  Không có báo cáo nào để đánh giá
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseSelectReportModal}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold font-sans hover:bg-gray-300 transition-all duration-200"
                aria-label="Hủy chọn báo cáo"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {isEvaluateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 font-sans">
                Đánh giá báo cáo
              </h2>
              <button
                onClick={handleCloseEvaluateModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Đóng modal đánh giá"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEvaluateSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="score"
                  className="block text-sm font-medium text-gray-700 font-sans mb-2"
                >
                  Điểm (0-10):
                </label>
                <input
                  type="number"
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans transition-all duration-200"
                  required
                  aria-describedby="score-error"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 font-sans mb-2"
                >
                  Nhận xét:
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans transition-all duration-200"
                  rows="5"
                  required
                  aria-describedby="comment-error"
                ></textarea>
              </div>
              {evaluateError && (
                <p
                  id="evaluate-error"
                  className="text-red-500 text-sm font-sans mb-5"
                >
                  {evaluateError}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEvaluateModal}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold font-sans hover:bg-gray-300 transition-all duration-200"
                  aria-label="Hủy đánh giá"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold font-sans hover:bg-blue-700 transition-all duration-200"
                  aria-label="Gửi đánh giá"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectReport;

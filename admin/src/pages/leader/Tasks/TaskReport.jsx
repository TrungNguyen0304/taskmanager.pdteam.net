import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PieChart } from "react-minimal-pie-chart";
import {
  FileText,
  AlertCircle,
  TrendingUp,
  Download,
  Calendar,
  ArrowLeft,
  Filter,
  Loader,
  MessageSquare,
  Star,
  X,
} from "lucide-react";
import CommentModal from "./CommentModal";

const TaskReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState({ message: "", reports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalReportId, setModalReportId] = useState(null);
  const [evaluateModalReportId, setEvaluateModalReportId] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    score: "",
    comment: "",
  });
  const [evaluationError, setEvaluationError] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const reportsPerPage = 3;

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8001/api/leader/showAllReportTask/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const reportsWithCommentData = await Promise.all(
        response.data.reports.map(async (report) => {
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
            console.error(
              `Error fetching comments for report ${report._id}:`,
              err
            );
            return { ...report, commentCount: 0, unreadCommentCount: 0 };
          }
        })
      );
      setReportsData({ ...response.data, reports: reportsWithCommentData });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Không có báo cáo nào của nhiệm vụ này.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [id]);

  const handleCommentUpdate = (reportId, commentCount) => {
    setReportsData((prev) => ({
      ...prev,
      reports: prev.reports.map((report) =>
        report._id === reportId
          ? { ...report, commentCount, unreadCommentCount: 0 }
          : report
      ),
    }));
  };

  const handleOpenCommentModal = (reportId) => {
    setModalReportId(reportId);
  };

  const handleCloseCommentModal = () => {
    setModalReportId(null);
    fetchReports();
  };

  const handleOpenEvaluateModal = (reportId) => {
    setEvaluateModalReportId(reportId);
    setEvaluationData({ score: "", comment: "" });
    setEvaluationError(null);
  };

  const handleCloseEvaluateModal = () => {
    setEvaluateModalReportId(null);
    setEvaluationData({ score: "", comment: "" });
    setEvaluationError(null);
  };

  const handleEvaluateReport = async () => {
    if (
      !evaluationData.score ||
      isNaN(Number(evaluationData.score)) ||
      Number(evaluationData.score) < 0 ||
      Number(evaluationData.score) > 10
    ) {
      setEvaluationError("Điểm đánh giá phải là số từ 0 đến 10.");
      return;
    }

    setEvaluationLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8001/api/leader/evaluateMemberReport/${evaluateModalReportId}`,
        {
          score: Number(evaluationData.score),
          comment: evaluationData.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update reports data to reflect evaluated status
      setReportsData((prev) => ({
        ...prev,
        reports: prev.reports.map((report) =>
          report._id === evaluateModalReportId
            ? { ...report, feedback: response.data.feedback._id }
            : report
        ),
      }));
      handleCloseEvaluateModal();
    } catch (err) {
      console.error("Error evaluating report:", err);
      setEvaluationError(
        err.response?.data?.message || "Lỗi khi đánh giá báo cáo."
      );
    } finally {
      setEvaluationLoading(false); // Set loading to false regardless of success or failure
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#22c55e";
    if (progress >= 80) return "#3b82f6";
    if (progress >= 60) return "#eab308";
    return "#ef4444";
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 100) return "text-green-600";
    if (progress >= 80) return "text-blue-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredReports = selectedDate
    ? reportsData.reports.filter((report) => {
        const reportDate = new Date(report.createdAt).toLocaleDateString(
          "vi-VN"
        );
        const selectedDateFormatted = new Date(selectedDate).toLocaleDateString(
          "vi-VN"
        );
        return reportDate === selectedDateFormatted;
      })
    : reportsData.reports;

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedDate("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-600 text-lg font-semibold animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 max-w-md w-full">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-12 h-12 text-blue-600 mb-2" />
            <p className="text-blue-700 text-center text-xl font-bold">
              {error}
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white transition"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-0 md:p-4">
      {/* Sidebar for filters */}
      <div className="lg:w-64 bg-white rounded-2xl shadow-md p-4 lg:sticky lg:top-4">
        <div className="flex items-center justify-between lg:justify-start gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <button
            className="lg:hidden flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-5 h-5" />
            Lọc
          </button>
        </div>
        <div className={`${isFilterOpen ? "block" : "hidden"} lg:block`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Lọc theo ngày</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {selectedDate && (
              <button
                onClick={handleResetFilter}
                className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                <X className="w-5 h-5" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Báo cáo nhiệm vụ
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Danh sách chi tiết báo cáo công việc
              </p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-3 flex flex-col items-center">
            <span className="text-sm text-blue-600 font-semibold">
              Tổng báo cáo
            </span>
            <span className="text-2xl font-bold text-blue-700">
              {filteredReports.length}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {currentReports.map((report, index) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                      {indexOfFirstReport + index + 1}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {report.task.name}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        Deadline:{" "}
                        {new Date(report.task.deadline).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Ngày tạo:{" "}
                    {new Date(report.createdAt).toLocaleString("vi-VN")}
                    <button
                      onClick={() => handleOpenEvaluateModal(report._id)}
                      disabled={report.feedback}
                      className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        report.feedback
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <Star className="w-5 h-5" />
                      {report.feedback ? "Đã đánh giá" : "Đánh giá báo cáo"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-900">
                        Nội dung báo cáo
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {report.content}
                    </p>
                  </div>

                  {report.difficulties && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-sm font-semibold text-yellow-900">
                          Khó khăn
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {report.difficulties}
                      </p>
                    </div>
                  )}

                  {report.file && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-green-600" />
                        <h3 className="text-sm font-semibold text-green-900">
                          File đính kèm
                        </h3>
                      </div>
                      <a
                        href={report.file}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống
                      </a>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4 flex gap-4">
                    <button
                      onClick={() => handleOpenCommentModal(report._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm font-semibold">
                        {report.commentCount || 0} Bình luận
                        {report.unreadCommentCount > 0 && (
                          <span className="text-red-600 font-semibold">
                            {" "}
                            +{report.unreadCommentCount} mới
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-800">
                      Tiến độ
                    </span>
                  </div>
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44">
                    <PieChart
                      data={[
                        {
                          value: report.taskProgress,
                          color: getProgressColor(report.taskProgress),
                        },
                        {
                          value: 100 - report.taskProgress,
                          color: "#e5e7eb",
                        },
                      ]}
                      lineWidth={20}
                      startAngle={-90}
                      animate
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${getProgressTextColor(
                          report.taskProgress
                        )}`}
                      >
                        {report.taskProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-semibold">
                Chưa có báo cáo nào
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Các báo cáo sẽ hiển thị tại đây khi có dữ liệu
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center sm:justify-end items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1.5 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        reportId={modalReportId}
        isOpen={!!modalReportId}
        onClose={handleCloseCommentModal}
        onCommentUpdate={handleCommentUpdate}
      />

      {/* Evaluate Report Modal */}
      {evaluateModalReportId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Đánh giá báo cáo
            </h2>
            {evaluationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {evaluationError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Điểm đánh giá (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationData.score}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      score: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập điểm từ 0 đến 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nhận xét
                </label>
                <textarea
                  value={evaluationData.comment}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      comment: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Nhập nhận xét của bạn"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCloseEvaluateModal}
                  disabled={evaluationLoading} // Disable button when loading
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEvaluateReport}
                  disabled={evaluationLoading} // Disable button when loading
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {evaluationLoading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay for Evaluation */}
      {evaluationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-2xl">
            <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-700 text-lg font-semibold">
              Đang gửi đánh giá...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReport;

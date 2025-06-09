import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  FileText,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Star,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaFileDownload } from "react-icons/fa";

// Backend base URL (adjust based on your backend configuration)
const BASE_URL = "http://localhost:8001";

const SeeReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // "details" or "evaluation"
    report: null,
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [evaluation, setEvaluation] = useState({ rating: 5, feedback: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportsPerPage = 5;

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/company/showAllReportLeader`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch reports");
        }

        // Map API data to component's expected format
        const mappedReports = data.reports.map((report) => ({
          id: report._id,
          projectName: report.project?.name || "Unknown Project",
          leaderName: report.assignedLeader?.name || "Unknown Leader",
          reportDate: new Date(report.createdAt).toLocaleDateString("vi-VN"),
          createdAt: new Date(report.createdAt), // Store the raw date for sorting
          weekRange: calculateWeekRange(new Date(report.createdAt)),
          status: "pending",
          progress: report.projectProgress || 0,
          summary: report.content || "No summary provided",
          achievements: report.content
            ? [report.content]
            : ["No achievements reported"],
          challenges: report.difficulties
            ? [report.difficulties]
            : ["No challenges reported"],
          nextWeekPlan: ["Plan not specified"],
          rating: null,
          adminFeedback: null,
          file: report.file ? `${BASE_URL}${report.file}` : null,
        }));

        // Sort reports by createdAt in descending order (newest first)
        mappedReports.sort((a, b) => b.createdAt - a.createdAt);

        setReports(mappedReports);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Helper function to decode file name (to handle encoded characters)
  const getFileName = (fileUrl) => {
    if (!fileUrl) return "No file attached";
    try {
      const decodedUrl = decodeURIComponent(fileUrl.split("/").pop());
      return decodedUrl;
    } catch {
      return fileUrl.split("/").pop();
    }
  };

  // Helper function to calculate week range based on report date
  const calculateWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString(
      "vi-VN"
    )} - ${endOfWeek.toLocaleDateString("vi-VN")}`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Filtering and pagination
  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesSearch =
      report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.leaderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Debounced handlers
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleViewDetails = useCallback(
    debounce((report) => {
      if (isProcessing || modalState.isOpen) return;
      setIsProcessing(true);
      setModalState({ isOpen: true, type: "details", report });
      setTimeout(() => setIsProcessing(false), 300);
    }, 300),
    [isProcessing, modalState.isOpen]
  );

  const handleEvaluate = useCallback(
    debounce((report) => {
      if (isProcessing || modalState.isOpen) return;
      setIsProcessing(true);
      setModalState({ isOpen: true, type: "evaluation", report });
      setEvaluation({
        rating: report.rating || 5,
        feedback: report.adminFeedback || "",
      });
      setTimeout(() => setIsProcessing(false), 300);
    }, 300),
    [isProcessing, modalState.isOpen]
  );

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, report: null });
    setEvaluation({ rating: 5, feedback: "" });
  }, []);

  const submitEvaluation = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    console.log("Đánh giá báo cáo:", {
      reportId: modalState.report.id,
      rating: evaluation.rating,
      feedback: evaluation.feedback,
    });
    // TODO: Add API call to submit evaluation
    closeModal();
    setTimeout(() => setIsProcessing(false), 300);
  }, [isProcessing, modalState.report, evaluation, closeModal]);

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div
        className="flex space-x-1"
        role="radiogroup"
        aria-label="Đánh giá sao"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive ? () => onChange(star) : undefined}
            role={interactive ? "radio" : undefined}
            aria-checked={interactive && star === rating}
            tabIndex={interactive ? 0 : -1}
            onKeyDown={(e) => {
              if (interactive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChange(star);
              }
            }}
          />
        ))}
      </div>
    );
  };

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-gray-600">Đang tải báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-red-600">Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Quản lý Báo cáo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi và đánh giá tiến độ dự án
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dự án/leader..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Tìm kiếm báo cáo"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {paginatedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {report.projectName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{report.leaderName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{report.weekRange}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{report.summary}</p>
                  {report.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(report.rating)}
                      <span className="text-xs text-gray-500">
                        ({report.rating}/5)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(report)}
                    disabled={isProcessing || modalState.isOpen}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    aria-label={`Xem chi tiết báo cáo ${report.projectName}`}
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleEvaluate(report)}
                    disabled={isProcessing || modalState.isOpen}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    aria-label={`Đánh giá báo cáo ${report.projectName}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Đánh giá
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Tiến độ</span>
                  <span>{report.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressColor(
                      report.progress
                    )}`}
                    style={{ width: `${report.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="mt-6 flex justify-end items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isProcessing}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={isProcessing}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Trang ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isProcessing}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal (Details or Evaluation) */}
        {modalState.isOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby={
              modalState.type === "details"
                ? "details-modal-title"
                : "evaluation-modal-title"
            }
          >
            {modalState.type === "details" && (
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                  <div>
                    <h2 id="details-modal-title" className="text-xl font-bold">
                      {modalState.report.projectName}
                    </h2>
                    <p className="text-sm opacity-80">
                      Báo cáo tuần: {modalState.report.weekRange}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 text-xl font-bold"
                    aria-label="Đóng chi tiết báo cáo"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {modalState.report.leaderName}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {modalState.report.reportDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Thành tựu
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {modalState.report.achievements.map(
                        (achievement, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 bg-green-50 p-2 rounded"
                          >
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></div>
                            <span>{achievement}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Khó khăn
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {modalState.report.challenges.map((challenge, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 bg-red-50 p-2 rounded"
                        >
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></div>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Kế hoạch tuần tới
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {modalState.report.nextWeekPlan.map((plan, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 bg-blue-50 p-2 rounded"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {modalState.report.file && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FaFileDownload className="w-4 h-4 text-blue-600" />
                        Tệp đính kèm
                      </h3>
                      <a
                        href={modalState.report.file}
                        download={getFileName(modalState.report.file)}
                        className="text-blue-600 hover:underline text-sm"
                        aria-label={`Tải xuống tệp ${getFileName(
                          modalState.report.file
                        )}`}
                      >
                        {getFileName(modalState.report.file)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {modalState.type === "evaluation" && (
              <div className="bg-white rounded-lg max-w-lg w-full custom-scrollbar">
                <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                  <div>
                    <h2
                      id="evaluation-modal-title"
                      className="text-xl font-bold"
                    >
                      Đánh giá Báo cáo
                    </h2>
                    <p className="text-sm opacity-80">
                      {modalState.report.projectName}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 text-xl font-bold"
                    aria-label="Đóng đánh giá báo cáo"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Chất lượng báo cáo
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(evaluation.rating, true, (rating) =>
                        setEvaluation((prev) => ({ ...prev, rating }))
                      )}
                      <span className="text-sm text-gray-600">
                        {evaluation.rating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Nhận xét
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-3 mt-2 focus:ring-2 focus:ring-green-600 focus:border-green-600 resize-none text-sm transition-all"
                      rows="4"
                      placeholder="Nhập nhận xét..."
                      value={evaluation.feedback}
                      onChange={(e) =>
                        setEvaluation((prev) => ({
                          ...prev,
                          feedback: e.target.value,
                        }))
                      }
                      aria-label="Nhận xét đánh giá"
                    />
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeModal}
                      disabled={isProcessing}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Hủy đánh giá"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={submitEvaluation}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Gửi đánh giá"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Không có báo cáo
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeeReportAdmin;

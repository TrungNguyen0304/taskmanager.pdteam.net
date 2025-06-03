import React, { useState, useCallback } from "react";
import {
  Eye,
  FileText,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Sample report data (unchanged)
const reports = [
  {
    id: 1,
    projectName: "E-commerce Platform",
    leaderName: "Nguyễn Văn A",
    reportDate: "2024-06-01",
    weekRange: "25/05 - 31/05/2024",
    status: "pending",
    progress: 75,
    summary: "Hoàn thành module thanh toán và tích hợp API",
    achievements: [
      "Hoàn thành 3/4 tính năng chính",
      "Tích hợp thành công payment gateway",
      "Sửa 15 bugs quan trọng",
    ],
    challenges: [
      "Gặp khó khăn với tối ưu database",
      "Thiếu resource để test performance",
    ],
    nextWeekPlan: [
      "Hoàn thiện module quản lý user",
      "Thực hiện stress testing",
      "Chuẩn bị deployment",
    ],
    rating: null,
    adminFeedback: null,
  },
  {
    id: 2,
    projectName: "Mobile Banking App",
    leaderName: "Trần Thị B",
    reportDate: "2024-05-30",
    weekRange: "24/05 - 30/05/2024",
    status: "approved",
    progress: 90,
    summary: "Hoàn thành giai đoạn testing và security audit",
    achievements: [
      "Vượt qua security audit",
      "Hoàn thành 100% test cases",
      "Tối ưu hiệu suất ứng dụng",
    ],
    challenges: ["Một số thiết bị cũ có vấn đề tương thích"],
    nextWeekPlan: ["Chuẩn bị release version 1.0", "Training team support"],
    rating: 4,
    adminFeedback:
      "Báo cáo chi tiết và dự án tiến độ tốt. Cần chú ý vấn đề tương thích thiết bị.",
  },
  {
    id: 3,
    projectName: "AI Chatbot System",
    leaderName: "Phạm Văn C",
    reportDate: "2024-05-29",
    weekRange: "22/05 - 29/05/2024",
    status: "rejected",
    progress: 45,
    summary: "Gặp khó khăn trong training model AI",
    achievements: [
      "Hoàn thành data preprocessing",
      "Setup infrastructure cơ bản",
    ],
    challenges: [
      "Model accuracy chưa đạt yêu cầu",
      "Thiếu data training chất lượng",
      "Team thiếu kinh nghiệm về AI",
    ],
    nextWeekPlan: ["Tìm kiếm thêm data training", "Thuê consultant AI"],
    rating: 2,
    adminFeedback:
      "Dự án gặp nhiều khó khăn. Cần có kế hoạch cụ thể để khắc phục vấn đề về AI model.",
  },
  {
    id: 4,
    projectName: "Inventory System",
    leaderName: "Lê Văn D",
    reportDate: "2024-05-28",
    weekRange: "21/05 - 28/05/2024",
    status: "pending",
    progress: 60,
    summary: "Hoàn thành giao diện quản lý kho",
    achievements: ["Thiết kế UI/UX", "Tích hợp API kho"],
    challenges: ["Tối ưu truy vấn database"],
    nextWeekPlan: ["Hoàn thiện báo cáo kho", "Kiểm tra bảo mật"],
    rating: null,
    adminFeedback: null,
  },
  {
    id: 5,
    projectName: "CRM Platform",
    leaderName: "Hoàng Thị E",
    reportDate: "2024-05-27",
    weekRange: "20/05 - 27/05/2024",
    status: "approved",
    progress: 85,
    summary: "Hoàn thành module khách hàng",
    achievements: ["Tích hợp CRM với email", "Hoàn thành dashboard"],
    challenges: ["Đồng bộ dữ liệu real-time"],
    nextWeekPlan: ["Tối ưu hiệu suất", "Triển khai thử nghiệm"],
    rating: 5,
    adminFeedback: "Báo cáo tốt, tiến độ vượt mong đợi.",
  },
  {
    id: 6,
    projectName: "HR Management",
    leaderName: "Đỗ Văn F",
    reportDate: "2024-05-26",
    weekRange: "19/05 - 26/05/2024",
    status: "rejected",
    progress: 30,
    summary: "Gặp vấn đề trong tích hợp API",
    achievements: ["Hoàn thành thiết kế database"],
    challenges: ["API bên thứ ba không ổn định"],
    nextWeekPlan: ["Khắc phục lỗi API", "Tăng cường testing"],
    rating: 3,
    adminFeedback: "Cần cải thiện kế hoạch khắc phục lỗi.",
  },
];

const SeeReportAdmin = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // "details" or "evaluation"
    report: null,
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [evaluation, setEvaluation] = useState({ rating: 5, feedback: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false); // For debouncing
  const reportsPerPage = 5;

  // Status styling (Monday.com-inspired colors)
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "approved":
        return "bg-green-100 text-green-800 border-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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

  // Debounced handler to prevent rapid clicks
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Handlers
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

  return (
    <div className="min-h-screen p-4">
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
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(report.status)}
                        <span>
                          {report.status === "pending"
                            ? "Chờ duyệt"
                            : report.status === "approved"
                            ? "Đã duyệt"
                            : "Từ chối"}
                        </span>
                      </div>
                    </span>
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
                <div className="bg-blue-600 text-white p-4 rounded-t-r-lg flex justify-between items-center">
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

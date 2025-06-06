import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import axios from "axios";

const ReportHistory = () => {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Base URL for the API (adjust if your server is hosted elsewhere)
  const BASE_URL = "http://localhost:8001";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/member/getReportTask/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else {
          setReports([]);
        }
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải lịch sử báo cáo."
        );
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  // Function to handle file download
  const handleDownload = (filePath) => {
    if (!filePath) return;
    const fullUrl = `${BASE_URL}${filePath}`;
    window.open(fullUrl, "_blank");
  };

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-200">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Lịch Sử Báo Cáo
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Tổng cộng: {reports.length} báo cáo
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-base font-medium">Đang tải...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Không có báo cáo
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Báo cáo sẽ được hiển thị khi được tạo.
            </p>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <div className="min-w-[1000px]">
                <table className="w-full table-auto">
                  <thead className="bg-blue-100">
                    <tr>
                      {[
                        "STT",
                        "Nhiệm Vụ",
                        "Tên Nhóm",
                        "Trưởng Nhóm",
                        "Nội Dung",
                        "Tiến Độ",
                        "Khó Khăn",
                        "Tệp",
                        "Thời Gian Tạo",
                      ].map((header) => (
                        <th
                          key={header}
                          className="py-4 px-4 text-left text-md font-semibold text-blue-600 border-b border-gray-200"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map((report, index) => (
                      <tr
                        key={report.reportId}
                        className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {indexOfFirstReport + index + 1}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.task.taskName}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.team.teamName}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.assignedLeader.leaderName}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.content}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.taskProgress}%
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {report.difficulties || "Không có"}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {report.file ? (
                            <button
                              onClick={() => handleDownload(report.file)}
                              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Tải xuống tệp"
                            >
                              <Download className="w-5 h-5" />
                              Tải xuống
                            </button>
                          ) : (
                            <span className="text-gray-500">Không có</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Section */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Hiển thị {indexOfFirstReport + 1} -{" "}
                {Math.min(indexOfLastReport, reports.length)} của{" "}
                {reports.length} báo cáo
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;

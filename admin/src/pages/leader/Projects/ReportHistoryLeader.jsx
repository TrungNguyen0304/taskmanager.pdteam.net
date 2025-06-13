import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Calendar, Users, ArrowLeft, Download } from "lucide-react";

const ReportHistoryLeader = () => {
  const { id } = useParams(); // projectId from URL
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/leader/getReportProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.reports && Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else {
          setReports([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải lịch sử báo cáo");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(fileUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob", // Important for handling binary data
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "report-file"); // Default file name if none provided
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    } catch (err) {
      console.error("Lỗi khi tải tệp:", err);
      alert("Không thể tải tệp. Vui lòng thử lại sau.");
    }
  };

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-gray-700">
            Đang tải lịch sử báo cáo...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có báo cáo
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có báo cáo nào cho dự án này.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 hover:underline text-blue-600 text-xl font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Quay lại</span>
        </button>
        <h1 className="text-3xl font-bold text-blue-600">
          Lịch sử báo cáo dự án
        </h1>
      </div>

      <div className="space-y-6">
        {currentReports.map((report) => (
          <div
            key={report.reportId}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin chung */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Báo cáo #{report.reportId}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      Nội dung báo cáo
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {report.content || "Chưa có nội dung"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      Khó khăn
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {report.difficulties ||
                        "Không có khó khăn nào được ghi nhận"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      Tiến độ dự án
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full"
                        style={{ width: `${report.projectProgress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-emerald-600 mt-1">
                      {report.projectProgress || 0}%
                    </p>
                  </div>

                  {report.file && (
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-600">
                        Tệp đính kèm:
                      </h4>
                      <button
                        onClick={() =>
                          handleDownload(
                            report.file,
                            `report-${report.reportId}`
                          )
                        }
                        className="flex items-center ml-2 gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <span>Tải xuống tệp</span>
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Dự án</span>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {report.project.projectName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">Nhóm</span>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {report.team.teamName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">Leader</span>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {report.assignedLeader.leaderName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-900">Ngày tạo</span>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReportHistoryLeader;

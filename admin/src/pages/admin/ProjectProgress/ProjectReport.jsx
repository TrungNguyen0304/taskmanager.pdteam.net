import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Folder, Users, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

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
        setProjectData(response.data.project);
        setError(null);
        window.scrollTo(0, 0);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải báo cáo dự án");
        setProjectData(null);
      }
    };

    fetchProjectReports();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-red-200 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-6 font-sans">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold font-sans transition"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium font-sans">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  // Pagination logic
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
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-sans"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 md:p-8">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white font-sans">
                Báo Cáo Dự Án: {projectData.project.name}
              </h1>
              <p className="text-blue-100 mt-2 text-sm sm:text-base md:text-lg font-sans">
                {projectData.project.description ||
                  "Tổng quan và báo cáo chi tiết của dự án"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
            {/* Project Overview */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-md">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 font-sans">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Thông Tin Tổng Quan
                </h3>
                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base">
                  <div>
                    <span className="text-gray-600 font-medium block mb-1 font-sans">
                      Tên dự án:
                    </span>
                    <p className="text-gray-900 font-semibold text-base sm:text-lg font-sans">
                      {projectData.project.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1 font-sans">
                      Mô tả:
                    </span>
                    <p className="text-gray-700 font-sans">
                      {projectData.project.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1 font-sans">
                      Đội nhóm:
                    </span>
                    <p className="text-gray-900 font-semibold text-base sm:text-lg font-sans">
                      {projectData.reports[0]?.team?.name || "Chưa chỉ định"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1 font-sans">
                      Quản lý:
                    </span>
                    <p className="text-gray-900 font-semibold text-base sm:text-lg font-sans">
                      {projectData.reports[0]?.assignedLeader?.name ||
                        "Chưa chỉ định"}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base font-sans">
                      {projectData.reports[0]?.assignedLeader?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-md">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 font-sans">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Báo Cáo Chi Tiết
                </h3>
                {currentReports.length ? (
                  currentReports.map((report) => (
                    <div
                      key={report._id}
                      className="p-4 sm:p-5 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600 font-medium block mb-1 font-sans">
                            Nội dung báo cáo:
                          </span>
                          <p className="text-gray-900 font-sans">
                            {report.content}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium block mb-1 font-sans">
                            Khó khăn:
                          </span>
                          <p className="text-gray-900 font-sans">
                            {report.difficulties ||
                              "Không có khó khăn được báo cáo"}
                          </p>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 font-medium block mb-1 font-sans">
                            File đính kèm:
                          </span>
                          <p className="text-gray-900 font-sans ml-2">
                            {report.file ? (
                              <a
                                href={report.file}
                                className="text-blue-600 hover:underline"
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
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600 font-medium font-sans">
                            Thời gian tạo:
                          </span>
                          <p className="text-gray-900 font-sans">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                    <p className="text-lg font-medium font-sans">
                      Không có báo cáo nào để hiển thị
                    </p>
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200 font-sans`}
                        aria-label="Trang trước"
                      >
                        Trước
                      </button>
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 font-sans ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200 font-sans`}
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
      </div>
    </div>
  );
};

export default ProjectReport;

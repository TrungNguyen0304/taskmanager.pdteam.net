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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-8">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white">
                Báo Cáo Dự Án: {projectData.project.name}
              </h1>
              <p className="text-blue-100 mt-2 text-base md:text-lg">
                {projectData.project.description ||
                  "Tổng quan và báo cáo chi tiết của dự án"}
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate(`/project/review/${id}`)}
                className="bg-white py-2 px-4 rounded-full font-medium"
              >
                Viết đánh giá
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {/* Project Overview */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Folder className="w-6 h-6 text-blue-600" />
                  Thông Tin Tổng Quan
                </h3>
                <div className="space-y-6 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium block mb-1">
                      Tên dự án:
                    </span>
                    <p className="text-gray-900 font-semibold text-base">
                      {projectData.project.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1">
                      Mô tả:
                    </span>
                    <p className="text-gray-700">
                      {projectData.project.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1">
                      Đội nhóm:
                    </span>
                    <p className="text-gray-900 font-semibold text-base">
                      {projectData.reports[0]?.team?.name || "Chưa chỉ định"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium block mb-1">
                      Quản lý:
                    </span>
                    <p className="text-gray-900 font-semibold text-base">
                      {projectData.reports[0]?.assignedLeader?.name ||
                        "Chưa chỉ định"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {projectData.reports[0]?.assignedLeader?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Báo Cáo Chi Tiết
                </h3>
                {projectData.reports.length ? (
                  projectData.reports.map((report) => (
                    <div
                      key={report._id}
                      className="p-5 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600 font-medium block mb-1">
                            Nội dung báo cáo:
                          </span>
                          <p className="text-gray-900">{report.content}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium block mb-1">
                            Khó khăn:
                          </span>
                          <p className="text-gray-900">
                            {report.difficulties ||
                              "Không có khó khăn được báo cáo"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600 font-medium">
                            Thời gian tạo:
                          </span>
                          <p className="text-gray-900">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                    <p className="text-lg font-medium">
                      Không có báo cáo nào để hiển thị
                    </p>
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

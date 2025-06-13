import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Eye,
  FileText,
  Calendar,
  Users,
  ClipboardList,
  Target,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project, onViewReport, onViewReportHistory }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "in-progress":
        return "Đang thực hiện";
      case "cancelled":
        return "Hủy";
      case "paused":
        return "Tạm ngưng";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden group">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{project.name}</h2>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onViewReport(project.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium transition-all duration-300 border border-white/20"
            >
              <FileText className="w-5 h-5" />
              <span>Báo cáo</span>
            </button>
            <button
              onClick={() => onViewReportHistory(project.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium transition-all duration-300 border border-white/20"
            >
              <History className="w-5 h-5" />
              <span>Lịch sử báo cáo</span>
            </button>
            <button
              onClick={() =>
                (window.location.href = `/project-detail/${project.id}`)
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-medium transition-all duration-300 shadow-sm"
            >
              <Eye className="w-5 h-5" />
              <span>Xem chi tiết</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái - Mô tả và tiến độ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mô tả */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mô tả dự án
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description || "Chưa có mô tả cho dự án này"}
              </p>
            </div>

            {/* Tiến độ với biểu đồ */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tiến độ thực hiện
                </h3>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10B981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        40 *
                        (1 - (project.averageTaskProgress || 0) / 100)
                      }`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                      {project.averageTaskProgress || 0}%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ hoàn thành</span>
                      <span className="font-medium text-emerald-600">
                        {project.averageTaskProgress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${project.averageTaskProgress || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải - Thông tin chi tiết */}
          <div className="space-y-4">
            {/* Deadline */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-gray-900">Deadline</span>
              </div>
              <p className="text-gray-700 font-medium ml-11">
                {project.deadline || "Chưa xác định"}
              </p>
            </div>

            {/* Trạng thái */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Trạng thái</span>
              </div>
              <div className="ml-11">
                <span
                  className={`inline-block px-3 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>

            {/* Mã nhóm */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Mã nhóm</span>
              </div>
              <p className="text-gray-700 font-medium ml-11">
                {project.teamId || "Chưa phân nhóm"}
              </p>
            </div>

            {/* Thống kê nhiệm vụ */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-900">
                  Thống kê nhiệm vụ
                </span>
              </div>
              <div className="ml-11 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng nhiệm vụ:</span>
                  <span className="font-semibold text-gray-900">
                    {project.taskStats?.totalTasks || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 2;

  useEffect(() => {
    // Cuộn lên đầu trang khi component được mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/leader/showallProject",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (
          Array.isArray(response.data.projects) &&
          response.data.projects.length > 0
        ) {
          const formattedProjects = response.data.projects.map((p) => ({
            id: p._id,
            name: p.name || "N/A",
            description: p.description || "Chưa có mô tả",
            deadline: p.deadline
              ? new Date(p.deadline).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Chưa xác định",
            status: p.status || "Không xác định",
            teamId: p.teamId || "Chưa phân nhóm",
            averageTaskProgress: p.averageTaskProgress || 0,
            taskStats: {
              totalTasks: p.taskStats?.totalTasks || 0,
            },
          }));
          setProjects(formattedProjects);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dự án:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewReport = (id) => {
    navigate(`/project-report/${id}`);
  };

  const handleViewReportHistory = (id) => {
    navigate(`/report-history/${id}`);
  };

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-gray-700">
            Đang tải dữ liệu dự án...
          </p>
          <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có dự án
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có dự án nào để hiển thị. Hãy tạo dự án mới để bắt
            đầu!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      {/* Project Cards */}
      <div className="space-y-8">
        {currentProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onViewReport={handleViewReport}
            onViewReportHistory={handleViewReportHistory}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
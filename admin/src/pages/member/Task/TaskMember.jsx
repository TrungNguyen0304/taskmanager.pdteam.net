import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, Clock, Flag, Zap } from "lucide-react";
import { GrUpdate } from "react-icons/gr";
import axios from "axios";

const PAGE_SIZE = 3;

const STATUS_SEQUENCE = ["Chưa bắt đầu", "Đang tiến hành", "Hoàn thành"];

const TaskMember = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added navigate hook

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/member/showallTask",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.tasks)) {
          const formatted = response.data.tasks.map((task, index) => ({
            id: task._id || `task-${index}`,
            name: task.name || "N/A",
            description: task.description || "N/A",
            status: task.status || "N/A",
            priority: task.priority || 0,
            deadline: task.deadline
              ? new Date(task.deadline).toLocaleDateString("vi-VN")
              : "N/A",
            projectId: task.projectId || "N/A",
          }));
          setTasks(formatted);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhiệm vụ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/task-detail/${id}`);
  };

  const handleReport = (task) => {
    alert(`Báo cáo nhiệm vụ: ${task.name}`);
  };

  const handleChangeStatus = async (task) => {
    const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % STATUS_SEQUENCE.length;
    const newStatus = STATUS_SEQUENCE[nextIndex];

    try {
      await axios.put(
        `https://apitaskmanager.pdteam.net/api/member/updateTaskStatus/${task.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", error);
      alert("Cập nhật trạng thái thất bại, vui lòng thử lại.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chưa bắt đầu":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Đang tiến hành":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Hoàn thành":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3:
        return "text-red-500";
      case 2:
        return "text-yellow-500";
      case 1:
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 3:
        return "Cao";
      case 2:
        return "Trung bình";
      case 1:
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      <div className="relative w-full">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-white/20 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {tasks.length}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Nhiệm Vụ Thành Viên
                </h1>
                <p className="text-gray-600 text-sm sm:text-md mt-2 font-medium">
                  Quản lý và theo dõi tiến độ công việc của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-spin">
                <div className="absolute inset-2 rounded-full bg-white"></div>
              </div>
              <FileText className="absolute inset-0 m-auto w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 text-lg sm:text-xl font-semibold">
                Đang tải dữ liệu...
              </p>
              <p className="text-gray-500 text-sm sm:text-base mt-2">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </div>
        ) : paginatedTasks.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              Không có nhiệm vụ nào
            </h3>
            <p className="text-gray-500 text-base sm:text-lg">
              Các nhiệm vụ sẽ hiển thị tại đây khi có dữ liệu
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {paginatedTasks.map((task, index) => (
              <div
                key={task.id}
                className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border overflow-hidden"
              >
                {/* Task Header */}
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 sm:p-6 border-b border-gray-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 truncate">
                          {task.name}
                        </h2>
                        <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">
                              Dự án: {task.projectId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium text-xs sm:text-sm">{task.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                    {/* Description */}
                    <div className="sm:col-span-2 xl:col-span-2">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 h-full border border-blue-100/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-blue-900">
                            Mô tả chi tiết
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-4 sm:line-clamp-6">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-yellow-100/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-yellow-900">
                            Trạng thái
                          </h3>
                        </div>
                        <div
                          className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-100/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-purple-900">
                            Độ ưu tiên
                          </h3>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-base sm:text-lg font-bold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                          {getPriorityText(task.priority)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <button
                        onClick={() => handleReport(task)}
                        className="group flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform text-sm sm:text-base min-h-[44px]"
                        aria-label={`Báo cáo nhiệm vụ ${task.name}`}
                      >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Báo cáo
                      </button>
                      <button
                        onClick={() => handleView(task.id)}
                        className="group flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform text-sm sm:text-base min-h-[44px]"
                        aria-label={`Xem chi tiết nhiệm vụ ${task.name}`}
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleChangeStatus(task)}
                        className="group flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform text-sm sm:text-base min-h-[44px]"
                        aria-label={`Thay đổi trạng thái nhiệm vụ ${task.name}`}
                      >
                        <GrUpdate className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:rotate-180 transition-transform duration-500" />
                        Thay đổi trạng thái
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 backdrop-blur-xl rounded-2xl hover:bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-gray-700 hover:text-gray-900 border border-white/30 text-sm sm:text-base min-h-[44px]"
              aria-label="Trang trước"
            >
              Trước
            </button>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base min-h-[44px] ${
                    currentPage === idx + 1
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      : "bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 border border-white/30"
                  }`}
                  aria-current={currentPage === idx + 1 ? "page" : undefined}
                  aria-label={`Trang ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-white/80 backdrop-blur-xl rounded-2xl hover:bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-gray-700 hover:text-gray-900 border border-white/30 text-sm sm:text-base min-h-[44px]"
              aria-label="Trang sau"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMember;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, Flag, Users } from "lucide-react";
import { GrUpdate } from "react-icons/gr";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const PAGE_SIZE = 3;

const STATUS_MAP = {
  not_started: "Chưa bắt đầu",
  in_progress: "Đang tiến hành",
  completed: "Hoàn thành",
};

const PRIORITY_MAP = {
  1: {
    text: "Thấp",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200",
  },
  2: {
    text: "Trung bình",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200",
  },
  3: {
    text: "Cao",
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200",
  },
};

const TaskMember = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/member/showallTask",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.tasks)) {
          const formatted = response.data.tasks.map((task) => ({
            id: task.id,
            name: task.name || "N/A",
            description: task.description || "N/A",
            status: STATUS_MAP[task.status] || "N/A",
            priority: task.priority || 0,
            deadline: task.deadline
              ? new Date(task.deadline).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "N/A",
            project: {
              id: task.project?.id || "N/A",
              name: task.project?.name || "N/A",
              team: {
                name: task.project?.team?.name || "N/A",
                leader: task.project?.team?.assignedLeader?.name || "N/A",
              },
            },
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

  const handleReport = (task) => {
    alert(`Báo cáo nhiệm vụ: ${task.name}`);
  };

  const handleChangeStatus = async (task) => {
    const statusSequence = Object.values(STATUS_MAP);
    const currentIndex = statusSequence.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusSequence.length;
    const newStatus = statusSequence[nextIndex];
    const apiStatus = Object.keys(STATUS_MAP).find(
      (key) => STATUS_MAP[key] === newStatus
    );

    try {
      await axios.put(
        `http://localhost:8001/api/member/updateTaskStatus/${task.id}`,
        { status: apiStatus },
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Chưa bắt đầu":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "Đang tiến hành":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Hoàn thành":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
                Danh Sách Nhiệm Vụ
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Tổng cộng: {tasks.length} nhiệm vụ
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-base sm:text-lg font-medium">
                Đang tải...
              </p>
            </div>
          </div>
        ) : paginatedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Không có nhiệm vụ
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Nhiệm vụ sẽ được hiển thị khi được giao.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {paginatedTasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6">
                  {/* Task Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </span>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Nhiệm vụ: {task.name}
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border flex items-center gap-2 ${
                          PRIORITY_MAP[task.priority]?.bg || "bg-gray-100"
                        } ${
                          PRIORITY_MAP[task.priority]?.color || "text-gray-600"
                        } ${
                          PRIORITY_MAP[task.priority]?.border ||
                          "border-gray-200"
                        }`}
                      >
                        <Flag className="w-4 h-4" />
                        {PRIORITY_MAP[task.priority]?.text || "Không xác định"}
                      </span>
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">{task.project.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">
                        {task.project.team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaUser className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">
                        Trưởng nhóm: {task.project.team.leader}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-3">
                      Mô tả nhiệm vụ
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Project Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>Hạn: {task.deadline}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleReport(task)}
                      className="flex-1 py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 border border-indigo-200 hover:border-indigo-300 transition-all"
                      aria-label={`Báo cáo nhiệm vụ ${task.name}`}
                    >
                      <FileText className="w-5 h-5" />
                      Báo cáo
                    </button>
                    <button
                      onClick={() => handleChangeStatus(task)}
                      className="flex-1 py-2 px-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 border border-green-200 hover:border-green-300 transition-all"
                      aria-label={`Thay đổi trạng thái nhiệm vụ ${task.name}`}
                    >
                      <GrUpdate className="w-5 h-5" />
                      Cập nhật trạng thái
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
              aria-label="Trang trước"
            >
              ←
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`w-10 h-10 rounded-lg text-sm sm:text-base font-medium ${
                  currentPage === idx + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                aria-current={currentPage === idx + 1 ? "page" : undefined}
                aria-label={`Trang ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
              aria-label="Trang sau"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMember;

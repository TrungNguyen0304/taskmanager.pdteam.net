import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, RotateCcw, Pencil } from "lucide-react";
import axios from "axios";

const PAGE_SIZE = 5;

const AssignedTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [projectFilter, setProjectFilter] = useState(""); // State for project name filter
  const [projectNames, setProjectNames] = useState([]); // State for unique project names

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/leader/getAssignedTask",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formatted = response.data.tasks.map((task, index) => ({
          id: task._id || `task-${index}`,
          name: task.name || "N/A",
          description: task.description || "N/A",
          assignedMember: task.assignedMember?.name || "N/A",
          projectName: task.projectId?.name || "N/A", // Add project name
          deadline: task.deadline
            ? new Date(task.deadline).toLocaleDateString("vi-VN")
            : "N/A",
          status: task.status || "N/A",
          progress: task.progress || 0,
        }));

        setTasks(formatted);

        // Extract unique project names
        const uniqueProjects = [
          ...new Set(
            formatted
              .map((task) => task.projectName)
              .filter((name) => name !== "N/A")
          ),
        ];
        setProjectNames(uniqueProjects);
      } catch (error) {
        alert("Không thể tải danh sách nhiệm vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, []);

  // Filter tasks by project name and assigned member
  const filteredTasks = tasks
    .filter((task) => task.assignedMember !== "N/A")
    .filter((task) =>
      projectFilter ? task.projectName === projectFilter : true
    );

  const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleRevoke = async (id) => {
    setIsActionLoading(true);
    setActionError("");
    try {
      await axios.put(
        `http://localhost:8001/api/leader/revokeTask/${id}/revoke`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, assignedMember: null } : task
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      setActionError("Không thể thu hồi nhiệm vụ.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openConfirmModal = (actionType, taskId) => {
    setConfirmAction(actionType);
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
    setConfirmAction(null);
    setActionError("");
  };

  const handleConfirm = () => {
    if (confirmAction === "delete") handleDelete(selectedTaskId);
    else if (confirmAction === "revoke") handleRevoke(selectedTaskId);
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectFilter]);

  return (
    <div className="p-0 md:p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
          Nhiệm Vụ Đang Làm
        </h2>
        {/* Project Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="projectFilter"
            className="text-lg font-medium text-gray-700"
          >
            Lọc theo dự án:
          </label>
          <select
            id="projectFilter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Tất cả dự án</option>
            {projectNames.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-blue-50 text-blue-800 text-xs sm:text-sm">
            <tr>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                #
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                Tên
              </th>
              <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">
                Mô tả
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                Dự án
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                Giao cho
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                Deadline
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                Tiến độ
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                Báo cáo
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-8 text-sm sm:text-base text-gray-500"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-8 text-sm sm:text-base text-gray-400"
                >
                  Không có nhiệm vụ nào đang làm.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task, idx) => (
                <tr
                  key={task.id}
                  className="border-t hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm sm:text-base">
                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                    {task.name}
                  </td>
                  <td className="px-4 py-3 text-sm sm:text-base hidden sm:table-cell truncate max-w-[200px]">
                    {task.description}
                  </td>
                  <td className="px-4 py-3 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                    {task.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm sm:text-base truncate max-w-[120px] sm:max-w-[150px]">
                    {task.assignedMember}
                  </td>
                  <td className="px-4 py-3 text-sm sm:text-base whitespace-nowrap">
                    {task.deadline}
                  </td>
                  <td className="px-4 py-3 text-sm sm:text-base whitespace-nowrap">
                    {task.progress}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/task-report/${task.id}`)}
                      className="bg-blue-600 py-1.5 px-3 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-blue-700 transition-colors"
                    >
                      Xem báo cáo
                    </button>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/task-detail/${task.id}`)}
                      title="Xem chi tiết"
                      className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => navigate(`/update-task/${task.id}`)}
                      title="Sửa"
                      className="p-2 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <Pencil className="w-5 h-5 text-yellow-600" />
                    </button>
                    <button
                      onClick={() => openConfirmModal("revoke", task.id)}
                      title="Thu hồi nhiệm vụ"
                      className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 text-purple-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-4 py-2 rounded-lg border font-medium text-sm sm:text-base transition-colors ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-900">
              Xác nhận {confirmAction === "delete" ? "xóa" : "thu hồi"} nhiệm vụ
            </h3>
            {actionError && (
              <p className="text-sm text-red-600 mb-4 text-center">
                {actionError}
              </p>
            )}
            <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
              Bạn có chắc chắn muốn{" "}
              {confirmAction === "delete" ? "xóa" : "thu hồi"} nhiệm vụ này?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium text-sm sm:text-base transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={isActionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm sm:text-base transition-colors disabled:bg-red-400"
              >
                {isActionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;

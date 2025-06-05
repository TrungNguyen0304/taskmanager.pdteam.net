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

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/leader/getAssignedTask",
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
          deadline: task.deadline
            ? new Date(task.deadline).toLocaleDateString("vi-VN")
            : "N/A",
          status: task.status || "N/A",
          progress: task.progress || 0,
        }));

        setTasks(formatted);
      } catch (error) {
        alert("Không thể tải danh sách nhiệm vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, []);

  const assignedTasks = tasks.filter((task) => task.assignedMember !== null);
  const totalPages = Math.ceil(assignedTasks.length / PAGE_SIZE);
  const paginatedTasks = assignedTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleRevoke = async (id) => {
    setIsActionLoading(true);
    setActionError("");
    try {
      await axios.put(
        `https://apitaskmanager.pdteam.net/api/leader/revokeTask/${id}/revoke`,
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

  return (
    <div className="p-2 md:p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 flex-1">
            Nhiệm Vụ Đang Làm
          </h2>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-blue-100 text-blue-700 text-base">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Tên</th>
                <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                <th className="px-4 py-3 text-left font-semibold">Giao cho</th>
                <th className="px-4 py-3 text-left font-semibold">Deadline</th>
                <th className="px-4 py-3 text-left font-semibold">Tiến độ</th>
                <th className="px-4 py-3 text-left font-semibold">Báo cáo</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-lg text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-400 text-lg"
                  >
                    Không có nhiệm vụ nào đang làm.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task, idx) => (
                  <tr
                    key={task.id}
                    className="border-t hover:bg-blue-50 transition"
                  >
                    <td className="px-4 py-3">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{task.name}</td>
                    <td className="px-4 py-3">{task.description}</td>
                    <td className="px-4 py-3">{task.assignedMember}</td>
                    <td className="px-4 py-3">{task.deadline}</td>

                    <td className="px-4 py-3">{task.progress}%</td>
                    <td>
                      <button className="bg-blue-600 py-1.5 px-4 rounded-full text-white font-semibold">
                        Xem báo cáo
                      </button>
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/task-detail/${task.id}`)}
                        title="Xem chi tiết"
                        className="p-2 rounded hover:bg-blue-100 group"
                      >
                        <Eye className="w-5 h-5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => navigate(`/update-task/${task.id}`)}
                        title="Sửa"
                        className="p-2 rounded hover:bg-yellow-100 group"
                      >
                        <Pencil className="w-5 h-5 text-yellow-500" />
                      </button>
                      <button
                        onClick={() => openConfirmModal("revoke", task.id)}
                        title="Thu hồi nhiệm vụ"
                        className="p-2 rounded hover:bg-purple-100 group"
                      >
                        <RotateCcw className="w-5 h-5 text-purple-500" />
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
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-4 py-2 rounded-lg border font-medium ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white border-blue-600 shadow"
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-96 max-w-full">
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-800">
                Xác nhận {confirmAction === "delete" ? "xóa" : "thu hồi"} nhiệm
                vụ
              </h3>
              {actionError && (
                <p className="text-sm text-red-500 mb-3 text-center">
                  {actionError}
                </p>
              )}
              <p className="text-center text-gray-600 mb-6">
                Bạn có chắc chắn muốn{" "}
                {confirmAction === "delete" ? "xóa" : "thu hồi"} nhiệm vụ này?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isActionLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  {isActionLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTasks;

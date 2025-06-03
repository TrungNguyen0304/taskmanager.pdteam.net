import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, FileText } from "lucide-react";
import { GrUpdate } from "react-icons/gr";
import axios from "axios";

const PAGE_SIZE = 3;

const STATUS_SEQUENCE = ["Chưa bắt đầu", "Đang tiến hành", "Hoàn thành"];

const TaskMember = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  // Hàm thay đổi trạng thái
  const handleChangeStatus = async (task) => {
    // Lấy trạng thái hiện tại
    const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
    // Tính trạng thái tiếp theo, nếu không tìm thấy thì quay lại đầu
    const nextIndex = (currentIndex + 1) % STATUS_SEQUENCE.length;
    const newStatus = STATUS_SEQUENCE[nextIndex];

    try {
      // Gọi API cập nhật trạng thái nhiệm vụ
      await axios.put(
        `https://apitaskmanager.pdteam.net/api/member/updateTaskStatus/${task.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Cập nhật trạng thái trong state để UI cập nhật luôn
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", error);
      alert("Cập nhật trạng thái thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-4 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline text-sm sm:text-base"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Nhiệm Vụ Thành Viên
        </h2>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500 text-center py-8">Đang tải dữ liệu...</p>
      ) : paginatedTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Không có nhiệm vụ nào.</p>
      ) : (
        <div className="space-y-6">
          {paginatedTasks.map((task, index) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 sm:p-6 hover:shadow transition flex flex-col sm:flex-row justify-between"
            >
              {/* Task info */}
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="text-sm text-gray-500 mb-1">
                  #{(currentPage - 1) * PAGE_SIZE + index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  <strong>Nhiệm vụ:</strong> {task.name}
                </h3>
                <p className="text-gray-700 mb-1">
                  <strong>Mô tả:</strong> {task.description}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Trạng thái:</strong> {task.status}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Độ ưu tiên:</strong> {task.priority}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Hạn chót:</strong> {task.deadline}
                </p>
                <p className="text-gray-700">
                  <strong>Mã dự án:</strong> {task.projectId}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 items-end justify-start sm:justify-end min-w-[160px]">
                <button
                  onClick={() => handleReport(task)}
                  className="flex items-center px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition text-sm sm:text-base"
                  aria-label={`Báo cáo nhiệm vụ ${task.name}`}
                >
                  <FileText className="w-5 h-5 mr-1" />
                  Báo cáo
                </button>
                <button
                  onClick={() => handleView(task.id)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm sm:text-base"
                  aria-label={`Xem chi tiết nhiệm vụ ${task.name}`}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Xem chi tiết
                </button>
                {/* Nút thay đổi trạng thái */}
                <button
                  onClick={() => handleChangeStatus(task)}
                  className="flex items-center px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 transition text-sm sm:text-base"
                  aria-label={`Thay đổi trạng thái nhiệm vụ ${task.name}`}
                >
                  <GrUpdate className="w-4 h-4 mr-2" /> Thay đổi trạng thái
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end mt-8 space-x-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-2 mb-2 border rounded transition text-sm sm:text-base ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
              aria-current={currentPage === idx + 1 ? "page" : undefined}
              aria-label={`Trang ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskMember;

import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProjectDetailLeader = () => {
  const { _id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressFilter, setProgressFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8001/api/leader/viewProject/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Không thể lấy dữ liệu từ API.");
        }
        const data = await response.json();

        // Transform API data to match component's expected format
        const transformedProject = {
          id: data.project._id,
          name: data.project.name,
          description: data.project.description,
          deadline: new Date(data.project.deadline).toLocaleDateString("vi-VN"),
          status: mapStatus(data.project.status),
          teamName: data.project.team.name,
        };

        const transformedTasks = data.tasks.map((task) => ({
          id: task._id,
          name: task.name,
          description: task.description,
          status: mapStatus(task.status),
          progress: task.progress,
          priority: mapPriority(task.priority),
          deadline: new Date(task.deadline).toLocaleDateString("vi-VN"),
          assignedMember: task.assignedMember?.name || "Chưa phân công",
        }));

        setProject(transformedProject);
        setTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi lấy dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    // Helper function to map status to Vietnamese
    const mapStatus = (status) => {
      switch (status.toLowerCase()) {
        case "pending":
          return "Chưa bắt đầu";
        case "in_progress":
          return "Đang thực hiện";
        case "completed":
          return "Hoàn thành";
        default:
          return status;
      }
    };

    // Helper function to map priority to Vietnamese
    const mapPriority = (priority) => {
      switch (priority) {
        case 1:
          return "Cao";
        case 2:
          return "Trung bình";
        case 3:
          return "Thấp";
        default:
          return "Không xác định";
      }
    };

    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    // Apply filters to tasks
    let updatedTasks = [...tasks];

    // Filter by progress
    if (progressFilter !== "all") {
      if (progressFilter === "0-50") {
        updatedTasks = updatedTasks.filter((task) => task.progress <= 50);
      } else if (progressFilter === "51-80") {
        updatedTasks = updatedTasks.filter(
          (task) => task.progress > 50 && task.progress <= 80
        );
      } else if (progressFilter === "81-100") {
        updatedTasks = updatedTasks.filter((task) => task.progress > 80);
      }
    }

    // Filter by status
    if (statusFilter !== "all") {
      updatedTasks = updatedTasks.filter(
        (task) => task.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      updatedTasks = updatedTasks.filter(
        (task) => task.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    setFilteredTasks(updatedTasks);
    setCurrentPage(1); // Reset to first page when filters change
  }, [progressFilter, statusFilter, priorityFilter, tasks]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error || !project)
    return (
      <div className="p-6">
        <p className="text-red-500">
          {error || "Không tìm thấy thông tin dự án."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline text-base md:text-xl"
        >
          <ArrowLeft className="w-6 h-6 mr-1" />
          Quay lại
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-[#183d5d] text-center md:text-right">
          Thông Tin Chi Tiết Dự Án
        </h2>
      </div>

      <div className="grid grid-cols-1  gap-4 text-lg mb-6">
        <div>
          <strong>Tên Dự Án:</strong> {project.name}
        </div>
        <div>
          <strong>Mô Tả:</strong> {project.description}
        </div>
        <div>
          <strong>Deadline:</strong> {project.deadline}
        </div>
        <div>
          <strong>Trạng Thái:</strong> {project.status}
        </div>
        <div>
          <strong>Team:</strong> {project.teamName}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-[#183d5d]">
        Danh Sách Nhiệm Vụ
      </h3>

      {/* Bộ lọc */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="mr-2 text-md font-medium">Lọc theo tiến độ:</label>
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">Tất cả</option>
            <option value="0-50">0-50%</option>
            <option value="51-80">51-80%</option>
            <option value="81-100">81-100%</option>
          </select>
        </div>
        <div>
          <label className="mr-2 text-md font-medium">
            Lọc theo trạng thái:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">Tất cả</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Chưa bắt đầu">Chưa bắt đầu</option>
          </select>
        </div>
        <div>
          <label className="mr-2 text-md font-medium">Lọc theo ưu tiên:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">Tất cả</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gradient-to-r from-[#183d5d] to-[#1d557a] text-white">
            <tr>
              <th className="px-4 py-2 border text-center">STT</th>
              <th className="px-4 py-2 border text-center">Tên Nhiệm Vụ</th>
              <th className="px-4 py-2 border text-center">Mô Tả</th>
              <th className="px-4 py-2 border text-center">Trạng Thái</th>
              <th className="px-4 py-2 border text-center">Tiến Độ (%)</th>
              <th className="px-4 py-2 border text-center">Ưu Tiên</th>
              <th className="px-4 py-2 border text-center">Deadline</th>
              <th className="px-4 py-2 border text-center">Người Được Giao</th>
            </tr>
          </thead>
          <tbody>
            {currentTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-3 text-gray-500">
                  Không có nhiệm vụ nào.
                </td>
              </tr>
            ) : (
              currentTasks.map((task, index) => (
                <tr key={task.id} className="even:bg-gray-100 text-center">
                  <td className="p-4 border">{indexOfFirstTask + index + 1}</td>
                  <td className="px-4 py-2 border">{task.name}</td>
                  <td className="px-4 py-2 border">{task.description}</td>
                  <td className="px-4 py-2 border capitalize">{task.status}</td>
                  <td className="px-4 py-2 border">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor:
                            task.progress < 50
                              ? "#f87171" // đỏ
                              : task.progress < 80
                              ? "#facc15" // vàng
                              : "#4ade80", // xanh lá
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1">{task.progress}%</div>
                  </td>
                  <td className="px-4 py-2 border">{task.priority}</td>
                  <td className="px-4 py-2 border">{task.deadline}</td>
                  <td className="px-4 py-2 border">{task.assignedMember}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Nút phân trang */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailLeader;

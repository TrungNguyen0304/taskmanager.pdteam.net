import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ProjectDetailLeader = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const projectResponse = await axios.get(
          `https://apitaskmanager.pdteam.net/api/leader/showallProject`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const projects = projectResponse.data.projects || [];
        const foundProject = projects.find((p) => p._id === projectId);

        if (!foundProject) throw new Error("Không tìm thấy dự án.");

        setProject({
          id: foundProject._id,
          name: foundProject.name || "N/A",
          description: foundProject.description || "N/A",
          deadline: foundProject.deadline
            ? new Date(foundProject.deadline).toLocaleDateString("vi-VN")
            : "N/A",
          status: foundProject.status || "N/A",
          teamId: foundProject.teamId || "N/A",
        });

        const tasksResponse = await axios.get(
          `https://apitaskmanager.pdteam.net/api/leader/showallTask/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formattedTasks = tasksResponse.data.tasks.map((task) => ({
          id: task._id,
          name: task.name || "N/A",
          description: task.description || "N/A",
          status: task.status || "N/A",
          progress: task.progress || 0,
          priority: task.priority || "N/A",
          deadline: task.deadline
            ? new Date(task.deadline).toLocaleDateString("vi-VN")
            : "N/A",
          assignedMember: task.assignedMember || "Chưa phân công",
        }));
        setTasks(formattedTasks);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi lấy dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

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
      <h2 className="text-3xl font-bold mb-6 text-[#183d5d]">
        Thông Tin Chi Tiết Dự Án
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base mb-6">
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
          <strong>Trạng Thái:</strong>{" "}
          <span className="capitalize">{project.status}</span>
        </div>
        <div>
          <strong>ID Team:</strong> {project.teamId}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-[#183d5d]">
        Danh Sách Nhiệm Vụ
      </h3>
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
                  <td className="p-4 border">
                    {indexOfFirstTask + index + 1}
                  </td>
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

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Quay lại danh sách
      </button>
    </div>
  );
};

export default ProjectDetailLeader;

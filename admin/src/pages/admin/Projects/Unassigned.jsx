import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Pencil, Trash2, Plus, UserPlus } from "lucide-react";

const Unassigned = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [assignedTeam, setAssignedTeam] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }

        const response = await axios.post(
          "http://localhost:8001/api/company/paginationunassigned",
          { limit, page: currentPage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProjects(response.data.projects || []);
        setTotalPages(response.data.pages || 1);
        setTotalProjects(response.data.total || 0);
      } catch (error) {
        console.error("Lỗi khi tải dự án:", error);
        setError("Không thể tải danh sách dự án.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8001/api/company/showallTeam",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeams(response.data.teams || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách team:", error);
      }
    };

    fetchProjects();
    fetchTeams();
  }, [navigate, currentPage, limit]);

  const handleAdd = () => {
    navigate("/create-projects");
  };

  const handleEdit = (id) => {
    navigate(`/update-projects/${id}`);
  };

  const handleDelete = (id) => {
    setSelectedProject(id);
    setActionType("delete");
    setShowModal(true);
    setAssignmentError("");
  };

  const handleAssign = (id) => {
    setSelectedProject(id);
    setActionType("assign");
    setShowModal(true);
    setAssignmentError("");
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem("token");

      if (actionType === "delete") {
        await axios.delete(
          `http://localhost:8001/api/company/deleteProject/${selectedProject}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(projects.filter((p) => p.id !== selectedProject));
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          setTotalProjects(totalProjects - 1);
          setTotalPages(Math.ceil((totalProjects - 1) / limit));
        }
      } else if (actionType === "assign") {
        if (!assignedTeam || !deadline) {
          setAssignmentError("Vui lòng chọn team và deadline.");
          return;
        }

        // Format deadline to ISO string with timezone
        const formattedDeadline = new Date(deadline).toISOString();

        const response = await axios.put(
          `http://localhost:8001/api/company/assignProject/${selectedProject}`,
          { assignedTeam, deadline: formattedDeadline },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update project list to reflect the assigned project
        setProjects(projects.filter((p) => p.id !== selectedProject));
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          setTotalProjects(totalProjects - 1);
          setTotalPages(Math.ceil((totalProjects - 1) / limit));
        }
        navigate("/project-assigned");
      }

      setShowModal(false);
      setAssignedTeam("");
      setDeadline("");
      setAssignmentError("");
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      if (error.response) {
        setAssignmentError(
          error.response.data.message || "Không thể thực hiện hành động."
        );
      } else {
        setAssignmentError("Lỗi kết nối server.");
      }
    }
  };

  const cancelAction = () => {
    setShowModal(false);
    setAssignedTeam("");
    setDeadline("");
    setAssignmentError("");
  };

  const handleViewProjectDetail = (id) => {
    navigate(`/project-detail/${id}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setLoading(true);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl text-blue-600 font-bold">
          Quản Lý Dự Án
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Dự Án
        </button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">Chưa có dự án nào.</p>
      ) : (
        <>
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold break-words">
                        {project.name}
                      </h3>
                      {project.status === "revoke" && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full whitespace-nowrap">
                          Mới bị thu hồi
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">
                      <span className="font-semibold text-black">Mô tả:</span>{" "}
                      {project.description}
                    </p>
                    <p className="text-gray-600">
                      <strong>Trạng thái:</strong> {project.status}
                    </p>
                    <p className="text-gray-600">
                      <strong>Ưu tiên:</strong> {project.priority}
                    </p>
                  </div>
                  <div className="flex flex-row gap-2 items-center mt-4">
                    <button
                      onClick={() => handleViewProjectDetail(project.id)}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </button>
                    <button
                      onClick={() => handleEdit(project.id)}
                      className="flex items-center px-3 py-1 border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50 whitespace-nowrap"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex items-center px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50 whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </button>
                    <button
                      onClick={() => handleAssign(project.id)}
                      className="flex items-center gap-1 px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-50 whitespace-nowrap"
                    >
                      <UserPlus size={16} /> Gán
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <p>
              Hiển thị {projects.length} / {totalProjects} dự án
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Tiếp
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {actionType === "delete" ? (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Xác nhận xóa dự án
                </h3>
                <p>Bạn có chắc muốn xóa dự án này không?</p>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={cancelAction}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Gán dự án cho team
                </h3>
                {assignmentError && (
                  <p className="text-red-500 mb-4">{assignmentError}</p>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="teamSelect"
                    className="block mb-1 font-medium"
                  >
                    Chọn Team
                  </label>
                  <select
                    id="teamSelect"
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Chọn team --</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="deadline" className="block mb-1 font-medium">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={cancelAction}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Gán
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Unassigned;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";

const ProjectAssigned = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [limit] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false); // Thêm state loading cho xóa/thu hồi
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
          "https://apitaskmanager.pdteam.net/api/company/paginationgetassigned",
          { page: currentPage, limit },
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

    fetchProjects();
  }, [navigate, currentPage, limit]);

  const handleEdit = (id) => navigate(`/update-projects/${id}`);

  const handleDelete = (id) => {
    setSelectedProject(id);
    setActionType("delete");
    setShowModal(true);
  };

  const handleRevoke = (id) => {
    setSelectedProject(id);
    setActionType("revoke");
    setShowModal(true);
  };

  const confirmAction = async () => {
    setIsProcessing(true); // Bật loading khi bắt đầu xử lý

    try {
      const token = localStorage.getItem("token");
      if (actionType === "delete") {
        await axios.delete(
          `https://apitaskmanager.pdteam.net/api/company/deleteProject/${selectedProject}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(projects.filter((p) => p.id !== selectedProject));
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          setTotalProjects(totalProjects - 1);
          setTotalPages(Math.ceil((totalProjects - 1) / limit));
        }
      } else if (actionType === "revoke") {
        await axios.put(
          `https://apitaskmanager.pdteam.net/api/company/revokeProject/${selectedProject}/revoke`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjects(
          projects.map((p) =>
            p.id === selectedProject
              ? { ...p, assignedTeam: null, deadline: null, status: "revoke" }
              : p
          )
        );
      }
      setShowModal(false);
      navigate("/project-unassigned");
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      setError(
        error.response?.data?.message || "Không thể thực hiện hành động."
      );
      setShowModal(false);
      alert(
        `Lỗi: ${
          error.response?.data?.message || "Không thể thực hiện hành động."
        }`
      );
    } finally {
      setIsProcessing(false); // Tắt loading
    }
  };

  const cancelAction = () => setShowModal(false);

  const handleViewProjectDetail = (id) => navigate(`/project-detail/${id}`);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setLoading(true);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      {/* Loading Overlay cho xóa/thu hồi */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">
              {actionType === "delete"
                ? "Đang xóa dự án..."
                : "Đang thu hồi dự án..."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-2xl font-bold">Quản Lý Dự Án</h2>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">Chưa có dự án nào.</p>
      ) : (
        <>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-gray-600">
                      <span className="font-semibold text-black">Mô tả:</span>{" "}
                      {project.description}
                    </p>
                    <p className="text-gray-600">
                      <strong>Trạng thái:</strong> {project.status}
                    </p>
                    <p className="text-gray-600">
                      <strong>Ưu tiên:</strong> {project.priority}
                    </p>
                    {project.assignedTeam && (
                      <p className="text-gray-600">
                        <strong>Đội ngũ:</strong> {project.assignedTeam.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    <button
                      onClick={() => handleViewProjectDetail(project.id)}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </button>
                    <button
                      onClick={() => handleEdit(project.id)}
                      className="flex items-center px-3 py-1 border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex items-center px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </button>
                    <button
                      onClick={() => handleRevoke(project.id)}
                      className="flex items-center px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Thu hồi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <p>
                Hiển thị {projects.length} / {totalProjects} dự án
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isProcessing}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isProcessing}
                      className={`px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  disabled={currentPage === totalPages || isProcessing}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {actionType === "delete"
                ? "Xác nhận xóa dự án"
                : "Xác nhận thu hồi dự án"}
            </h3>
            <p>
              Bạn có chắc chắn muốn{" "}
              {actionType === "delete" ? "xóa" : "thu hồi"} dự án này không?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {actionType === "delete"
                      ? "Đang xóa..."
                      : "Đang thu hồi..."}
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssigned;

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Thêm state loading cho xóa
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/company/showallTeam",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.teams)) {
          setDepartments(response.data.teams);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleView = (id) => {
    navigate("/department-detail", { state: { departmentId: id } });
  };

  const handleEdit = (id) => {
    navigate(`/update-department/${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedDepartmentId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartmentId) return;
    setIsDeleting(true); // Bật loading khi bắt đầu xóa

    try {
      await axios.delete(
        `https://apitaskmanager.pdteam.net/api/company/deleteTeam/${selectedDepartmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDepartments((prev) =>
        prev.filter((dept) => dept._id !== selectedDepartmentId)
      );
    } catch (error) {
      console.error("Lỗi khi xóa phòng ban:", error);
      alert("Xóa phòng ban thất bại!");
    } finally {
      setIsDeleting(false); // Tắt loading
      setIsConfirmModalOpen(false);
      setSelectedDepartmentId(null);
    }
  };

  const handleCreate = () => {
    navigate("/create-department");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <p>Đang tải dữ liệu phòng ban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Loading Overlay cho việc xóa */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Đang xóa phòng ban...</p>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Bạn có chắc muốn xóa phòng ban này?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedDepartmentId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="w-full mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Quản Lý Phòng Ban
            </h2>
            <p className="text-gray-600">
              Danh sách các phòng ban trong công ty
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            Thêm Phòng Ban
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border border-gray-200 text-sm md:text-base">
            <thead className="bg-gradient-to-r from-[#183d5d] to-[#1d557a] text-white">
              <tr className="text-center">
                <th className="px-4 py-2 border">STT</th>
                <th className="px-4 py-2 border">Tên Phòng Ban</th>
                <th className="px-4 py-2 border">Mô Tả</th>
                <th className="px-4 py-2 border">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Không có phòng ban nào.
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => (
                  <tr
                    key={dept._id || `dept-${index}`}
                    className="hover:bg-gray-50 even:bg-gray-100"
                  >
                    <td className="px-4 py-2 border text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border">{dept.name || "N/A"}</td>
                    <td className="px-4 py-2 border">
                      {dept.description || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(dept._id)}
                          className="flex items-center px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(dept._id)}
                          className="flex items-center px-3 py-1 border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dept._id)}
                          className="flex items-center px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;

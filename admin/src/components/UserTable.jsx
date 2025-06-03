import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const UserTable = ({
  title,
  fetchUrl,
  deleteUrl,
  createLink = "/create-user",
  originPage,
}) => {
  const [users, setUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(users.length / PAGE_SIZE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (users.length === 0) {
      setCurrentPage(1);
    }
  }, [users, currentPage]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.leaders || res.data.members || res.data.users || res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    setIsDeleting(true);
    try {
      await axios.delete(`${deleteUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newUsers = users.filter((user) => user._id !== id);
      setUsers(newUsers);

      const totalPages = Math.ceil(newUsers.length / PAGE_SIZE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(users.length / PAGE_SIZE)) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <NavLink
          to={createLink}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm
        </NavLink>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full table-fixed border border-gray-300 text-sm">
          <thead className="bg-gradient-to-r from-[#183d5d] to-[#1d557a] text-white">
            <tr>
              <th className="w-[5%] px-4 py-2 border text-center">ID</th>
              <th className="w-[20%] px-4 py-2 border text-center">Họ và Tên</th>
              <th className="w-[12%] px-4 py-2 border text-center">Ngày sinh</th>
              <th className="w-[10%] px-4 py-2 border text-center">Giới tính</th>
              <th className="w-[18%] px-4 py-2 border text-center">Email</th>
              <th className="w-[10%] px-4 py-2 border text-center">Vai Trò</th>
              <th className="w-[25%] px-4 py-2 border text-center">Chức Năng</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => {
                const formattedDate =
                  user.dateOfBirth && !isNaN(Date.parse(user.dateOfBirth))
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "";

                const gender =
                  user.gender === "0" || user.gender === 0
                    ? "Nam"
                    : user.gender === "1" || user.gender === 1
                      ? "Nữ"
                      : user.gender || "";

                const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1;

                return (
                  <tr
                    key={user._id || index}
                    className="even:bg-gray-100 text-center"
                  >
                    <td className="px-4 py-2 border">{globalIndex}</td>
                    <td className="px-4 py-2 border">{user.name || ""}</td>
                    <td className="px-4 py-2 border">{formattedDate}</td>
                    <td className="px-4 py-2 border">{gender}</td>
                    <td className="px-4 py-2 border truncate">{user.email || ""}</td>
                    <td className="px-4 py-2 border">{user.role || ""}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <NavLink
                          to={
                            originPage === "leader"
                              ? "/leader-detail"
                              : "/member-detail"
                          }
                          state={{
                            employee: user,
                            index: globalIndex,
                            originPage,
                          }}
                          className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-800"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </NavLink>
                        <NavLink
                          to="/update-user"
                          state={{
                            employee: user,
                            index: globalIndex,
                            originPage,
                          }}
                          className="flex items-center px-3 py-1 border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Sửa
                        </NavLink>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="flex items-center px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${currentPage === page
                  ? "bg-gradient-to-r from-[#183d5d] to-[#1d557a] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <span className="text-red-600">{deleteTarget.name}</span>?
            </h3>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteTarget._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blue-600" />
          <p className="text-lg font-medium text-white ml-4">
            Đang xóa người dùng...
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;

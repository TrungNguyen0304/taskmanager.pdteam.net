import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const UpdateDepartment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedLeader, setAssignedLeader] = useState("");
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const token = localStorage.getItem("token");
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teamRes, leadersRes, membersRes] = await Promise.all([
          axios.get(
            `https://apitaskmanager.pdteam.net/api/company/viewTeam/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            "https://apitaskmanager.pdteam.net/api/company/showallLeaders",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            "https://apitaskmanager.pdteam.net/api/company/showallMember",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const team = teamRes.data.team;
        if (!team) throw new Error("Không tìm thấy thông tin phòng ban.");

        setName(team.name || "");
        setDescription(team.description || "");
        setAssignedLeader(team.assignedLeader?._id || "");
        setAssignedMembers(
          team.assignedMembers?.map((m) => m._id.toString()) || []
        );

        setLeaders(
          leadersRes.data.leaders.map((l) => ({ id: l._id, name: l.name })) ||
            []
        );
        setMembers(
          membersRes.data.members.map((m) => ({ id: m._id, name: m.name })) ||
            []
        );
        setError("");
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(
          "Không thể tải dữ liệu phòng ban. Vui lòng thử lại hoặc kiểm tra server."
        );
      }
    };

    fetchAll();
  }, [id, token]);

  const handleCancel = () => {
    navigate("/departments");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading spinner
    try {
      const payload = {
        name,
        description,
        assignedLeader,
        assignedMembers,
      };

      await axios.put(
        `https://apitaskmanager.pdteam.net/api/company/updateTeam/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/departments");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  const filteredMembers = members.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-600 border-gray-300 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="w-full mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Chỉnh Sửa Phòng Ban
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên phòng ban */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên Phòng Ban
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mô Tả
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Leader */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Người Quản Lý (Leader)
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded"
              value={assignedLeader}
              onChange={(e) => setAssignedLeader(e.target.value)}
              required
            >
              <option value="">-- Chọn người quản lý --</option>
              {leaders.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tìm kiếm */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tìm kiếm nhân viên
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Employees */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nhân viên (nhấn + để thêm, − để xóa)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {paginatedMembers.map((emp) => {
                const isSelected = assignedMembers.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between border border-gray-300 rounded p-2"
                  >
                    <span>{emp.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        isSelected
                          ? setAssignedMembers(
                              assignedMembers.filter((e) => e !== emp.id)
                            )
                          : setAssignedMembers([...assignedMembers, emp.id])
                      }
                      className={`px-2 py-1 rounded font-bold transition ${
                        isSelected
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {isSelected ? "−" : "+"}
                    </button>
                  </div>
                );
              })}
            </div>

            {assignedMembers.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-gray-700 mb-1">Đã chọn:</h4>
                <ul className="list-disc list-inside text-gray-800">
                  {assignedMembers.map((empId) => {
                    const emp = members.find((m) => m.id === empId);
                    return <li key={empId}>{emp.name}</li>;
                  })}
                </ul>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Trước
              </button>
              <span className="text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Sau
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={!!error || isLoading}
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDepartment;

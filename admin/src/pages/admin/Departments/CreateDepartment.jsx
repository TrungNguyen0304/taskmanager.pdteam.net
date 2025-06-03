import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateDepartment = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leadersList, setLeadersList] = useState([]);
  const [membersList, setMembersList] = useState([]);

  const token = localStorage.getItem("token");
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // Fetch leaders and members with id and name
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await axios.get(
          "https://apitaskmanager.pdteam.net/api/company/showallLeaders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Save both id and name for leaders
        setLeadersList(
          res.data.leaders.map((l) => ({ id: l._id, name: l.name }))
        );
      } catch (err) {
        console.error("Lỗi khi tải leaders:", err);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          "https://apitaskmanager.pdteam.net/api/company/showallMember",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Save both id and name for members
        setMembersList(
          res.data.members.map((m) => ({ id: m._id, name: m.name }))
        );
      } catch (err) {
        console.error("Lỗi khi tải members:", err);
      }
    };

    fetchLeaders();
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newDepartment = {
      name,
      description,
      assignedLeader: leader, // ID of the leader
      assignedMembers: employees, // Array of employee IDs
    };

    try {
      const res = await axios.post(
        "https://apitaskmanager.pdteam.net/api/company/createTeam",
        newDepartment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Phòng ban được tạo:", res.data);
      alert("Phòng ban đã được tạo!");
      navigate("/departments");
    } catch (err) {
      console.error(
        "Lỗi khi tạo phòng ban:",
        err.response?.data || err.message
      );
      alert("Tạo phòng ban thất bại!");
    }
  };

  const handleCancel = () => navigate("/departments");

  const filteredMembers = membersList.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Tạo Phòng Ban Mới
        </h2>
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
              required
            />
          </div>

          {/* Leader */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Người Quản Lý (Leader)
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              required
            >
              <option value="">-- Chọn người quản lý --</option>
              {leadersList.map((emp) => (
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
                const isSelected = employees.includes(emp.id);
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
                          ? setEmployees(employees.filter((e) => e !== emp.id))
                          : setEmployees([...employees, emp.id])
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

            {employees.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-gray-700 mb-1">Đã chọn:</h4>
                <ul className="list-disc list-inside text-gray-800">
                  {employees.map((empId) => {
                    const emp = membersList.find((m) => m.id === empId);
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
            >
              Tạo Phòng Ban
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartment;

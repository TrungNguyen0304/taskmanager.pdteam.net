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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teamRes, leadersRes, membersRes] = await Promise.all([
          axios.get(`https://apitaskmanager.pdteam.net/api/company/viewTeam/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://apitaskmanager.pdteam.net/api/company/showallLeaders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://apitaskmanager.pdteam.net/api/company/showallMember", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const team = teamRes.data.team;
        if (!team) throw new Error("Không tìm thấy thông tin phòng ban.");

        setName(team.name || "");
        setDescription(team.description || "");
        setAssignedLeader(team.assignedLeader?._id || "");
        setAssignedMembers(
          team.assignedMembers?.map((m) => m._id.toString()) || []
        );

        setLeaders(leadersRes.data.leaders || []);
        setMembers(membersRes.data.members || []);
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Chỉnh Sửa Phòng Ban
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Hiển thị thông tin hiện tại */}
        {assignedLeader && (
          <div className="mb-2 text-gray-700">
            <strong>Trưởng phòng hiện tại:</strong>{" "}
            {leaders.find((l) => l._id === assignedLeader)?.name ||
              "Không xác định"}
          </div>
        )}

        {assignedMembers.length > 0 && (
          <div className="mb-4 text-gray-700">
            <strong>Thành viên hiện tại:</strong>
            <ul className="list-disc list-inside ml-4">
              {assignedMembers.map((memberId) => {
                const member = members.find((m) => m._id === memberId);
                return (
                  <li key={memberId}>{member?.name || "Không xác định"}</li>
                );
              })}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Tên Phòng Ban</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Mô Tả</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Trưởng Phòng</label>
            <select
              value={assignedLeader}
              onChange={(e) => setAssignedLeader(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- Chọn trưởng phòng --</option>
              {leaders.map((leader) => (
                <option key={leader._id} value={leader._id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Thành Viên</label>
            <select
              multiple
              value={assignedMembers}
              onChange={(e) =>
                setAssignedMembers(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
              className="w-full p-2 border border-gray-300 rounded h-40"
            >
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4">
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
              disabled={!!error}
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

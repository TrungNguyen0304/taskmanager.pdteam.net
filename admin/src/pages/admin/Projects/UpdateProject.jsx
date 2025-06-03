import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState(2);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `https://apitaskmanager.pdteam.net/api/company/viewTeamProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const project = response.data.project;
        setName(project.name || "");
        setDescription(project.description || "");
        setStatus(project.status || "pending");
        setPriority(project.priority || 2);
      } catch (error) {
        alert("Không tìm thấy dự án hoặc lỗi xác thực.");
        navigate(-1);
      }
    };

    fetchProject();
  }, [id, navigate, token]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://apitaskmanager.pdteam.net/api/company/updateProject/${id}`,
        {
          name,
          description,
          status,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Dự án đã được cập nhật!");
      navigate(-1); // Go back to the previous page (project-assigned or project-unassigned)
    } catch (error) {
      alert("Lỗi khi cập nhật dự án hoặc xác thực thất bại.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Chỉnh Sửa Dự Án</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700">
            Tên Dự Án
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2 border border-gray-300 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700">
            Mô Tả
          </label>
          <textarea
            id="description"
            className="w-full p-2 border border-gray-300 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-gray-700">
            Trạng Thái
          </label>
          <select
            id="status"
            className="w-full p-2 border border-gray-300 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Đang chờ</option>
            <option value="revoke">Thu hồi</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-gray-700">
            Mức Độ Ưu Tiên
          </label>
          <select
            id="priority"
            className="w-full p-2 border border-gray-300 rounded"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            <option value={1}>Cao</option>
            <option value={2}>Trung bình</option>
            <option value={3}>Thấp</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Hủy
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Cập Nhật
        </button>
      </div>
    </div>
  );
};

export default UpdateProject;
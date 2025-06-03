import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const status = "pending"; // Mặc định là "chờ xử lý"
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("https://apitaskmanager.pdteam.net/api/company/createProject", {
        name,
        description,
        status,
        priority: Number(priority),
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Dự án đã được tạo!");
      navigate("/project-unassigned");
    } catch (error) {
      alert(`Tạo dự án thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Thêm Dự Án Mới</h2>
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
        {/* <div>
          <label className="block text-gray-700">Trạng Thái</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            value="Chờ xử lý"
            disabled
          />
        </div> */}
        <div>
          <label htmlFor="priority" className="block text-gray-700">
            Mức Ưu Tiên
          </label>
          <select
            id="priority"
            className="w-full p-2 border border-gray-300 rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
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
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Tạo Dự Án
        </button>
      </div>
    </div>
  );
};

export default CreateProject;

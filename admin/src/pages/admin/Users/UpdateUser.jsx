import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = location.state?.employee;

  const [loading, setLoading] = useState(false); // ✅ Trạng thái loading

  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    password: "",
    gender:
      employee?.gender === "0" || employee?.gender === 0
        ? "Nam"
        : employee?.gender === "1" || employee?.gender === 1
        ? "Nữ"
        : "",
    dateOfBirth: employee?.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
      : "",
    address: employee?.address || "",
    phoneNumber: employee?.phoneNumber || "",
    role: employee?.role || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEmployee = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true); // ✅ Bắt đầu loading

    try {
      await axios.put(
        `http://localhost:8001/api/company/updateUser/${employee._id}`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          gender:
            formData.gender === "Nam"
              ? "0"
              : formData.gender === "Nữ"
              ? "1"
              : "",
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/member");
    } catch (err) {
      console.error("Lỗi khi cập nhật nhân viên:", err);
    } finally {
      setLoading(false); // ✅ Kết thúc loading
    }
  };

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-red-600">Không có dữ liệu nhân viên để cập nhật.</p>
        <button
          onClick={() => navigate("/member")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full mx-auto relative">
      <h2 className="text-2xl font-bold mb-4">Cập Nhật Nhân Viên</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border p-4 rounded-lg bg-gray-50">
        <div className="flex flex-col items-center md:col-span-1">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-2 text-sm text-gray-600">
            Chưa có avatar
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Upload
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm md:col-span-2">
          <div>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Họ và Tên"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Mật khẩu mới (nếu muốn thay đổi)"
            />
          </div>

          <div className="flex items-center space-x-4 col-span-1 sm:col-span-2 md:col-span-3">
            <span>Giới Tính:</span>
            <label>
              <input
                type="radio"
                name="gender"
                value="Nam"
                checked={formData.gender === "Nam"}
                onChange={handleInputChange}
                className="mr-1"
              />
              Nam
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Nữ"
                checked={formData.gender === "Nữ"}
                onChange={handleInputChange}
                className="mr-1"
              />
              Nữ
            </label>
          </div>

          <div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Địa Chỉ"
            />
          </div>

          <div>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Số Điện Thoại"
            />
          </div>

          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              required
              disabled={
                formData.role === "leader" || formData.role === "member"
              }
            >
              <option value="">Chức Vụ</option>
              <option value="leader">Leader</option>
              <option value="member">Nhân viên</option>
            </select>
            {(formData.role === "leader" || formData.role === "member") && (
              <p className="text-sm text-gray-500 mt-1 px-2">
                Chức vụ hiện tại không thể thay đổi.
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-end gap-4 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateEmployee}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Overlay loading */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded shadow-md flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Đang cập nhật...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;

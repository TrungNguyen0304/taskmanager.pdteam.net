import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    role: "member",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmployee = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);
      await axios.post(
        "https://apitaskmanager.pdteam.net/api/company/createUser",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
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

      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        phoneNumber: "",
        role: "member",
      });
      navigate("/member");
    } catch (err) {
      console.error("Lỗi khi thêm nhân viên:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center flex flex-col items-center">
          <AiOutlineLoading3Quarters className="animate-spin text-blue-600 text-4xl mb-4" />
          <p className="text-lg font-medium">Đang thêm member...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Thêm Nhân Viên</h2>

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
            />
          </div>

          <div>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full"
              placeholder="Nhập mật khẩu"
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
              />{" "}
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
              />{" "}
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
            <input
              type="text"
              name="role"
              value="Member"
              disabled
              className="border px-2 py-1 rounded w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-end gap-4 mt-4">
            <button
              onClick={() => navigate("/member")}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              disabled={isLoading}
            >
              Hủy
            </button>

            <button
              onClick={handleAddEmployee}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <span>Thêm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;

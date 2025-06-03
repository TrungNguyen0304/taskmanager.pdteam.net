import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import imgUser from "../assets/images/avatar-none.png";

const ManagementDetail = ({ fetchUrl, title, isLeader = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const employeeIndex = location.state?.index;
  const originPage = location.state?.originPage;
  const employeeId = location.state?.employee?._id;
  const fallbackEmployee = location.state?.employee;

  const [employee, setEmployee] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setError("Không có ID nhân viên để tải dữ liệu.");
      setEmployee(fallbackEmployee);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setEmployee(fallbackEmployee);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${fetchUrl}/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(response.data.user);
        setTeams(response.data.teams || []);
        setTasks(
          isLeader ? response.data.projects || [] : response.data.tasks || []
        );
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Người dùng không tồn tại.");
        } else if (err.response?.status === 401) {
          setError("Không có quyền truy cập. Vui lòng kiểm tra đăng nhập.");
        } else {
          setError("Lỗi khi tải thông tin: " + err.message);
        }
        setEmployee(fallbackEmployee);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [employeeId, fetchUrl, fallbackEmployee, isLeader]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-xl shadow-lg w-full text-center">
          <p className="text-red-600 text-lg font-medium mb-4">
            {error || "Không có dữ liệu nhân viên."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const gender =
    employee.gender === "0" || employee.gender === 0
      ? "Nam"
      : employee.gender === "1" || employee.gender === 1
      ? "Nữ"
      : employee.gender || "N/A";

  const formattedDate =
    employee.dateOfBirth && !isNaN(Date.parse(employee.dateOfBirth))
      ? new Date(employee.dateOfBirth).toLocaleDateString("vi-VN")
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm opacity-80">
            Chi tiết thông tin cá nhân và công việc
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 text-center">
              <img
                src={imgUser}
                alt="Employee"
                className="w-32 h-32 rounded-full mx-auto border-4 border-blue-100 object-cover"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/128")
                }
              />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                {employee.name || "N/A"}
              </h2>
              <p className="text-sm text-gray-500">{employee.email || "N/A"}</p>
            </div>

            {/* Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Thông Tin Cá Nhân
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium text-gray-600">
                      ID Nhân Viên:
                    </span>{" "}
                    {employeeIndex || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Họ Tên:</span>{" "}
                    {employee.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Ngày Sinh:
                    </span>{" "}
                    {formattedDate}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Giới Tính:
                    </span>{" "}
                    {gender}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Số Điện Thoại:
                    </span>{" "}
                    {employee.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Địa Chỉ:</span>{" "}
                    {employee.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Work Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Thông Tin Công Việc
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium text-gray-600">Vai Trò:</span>{" "}
                    {employee.role || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Phòng Ban:
                    </span>{" "}
                    {teams.length > 0
                      ? teams.map((team) => team.name).join(", ")
                      : "Không có"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      {isLeader ? "Dự Án:" : "Nhiệm Vụ:"}
                    </span>{" "}
                    {tasks.length > 0
                      ? tasks
                          .map((task) => `${task.name} (${task.description})`)
                          .join(", ")
                      : "Không có"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Quay Lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDetail;

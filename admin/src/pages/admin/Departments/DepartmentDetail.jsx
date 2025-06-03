import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const DepartmentDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departmentId } = location.state || {};

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 12;

  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    if (!departmentId) {
      setError("Không có ID phòng ban để tải dữ liệu.");
      setLoading(false);
      return;
    }

    const fetchDepartment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://apitaskmanager.pdteam.net/api/company/viewTeam/${departmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDepartment(response.data.team);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Phòng ban không tồn tại.");
        } else if (err.response?.status === 401) {
          setError("Không có quyền truy cập. Vui lòng kiểm tra đăng nhập.");
        } else {
          setError("Lỗi khi tải thông tin: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Đang tải thông tin phòng ban...</p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-red-600">
          {error || "Không tìm thấy thông tin phòng ban."}
        </p>
      </div>
    );
  }

  // Xử lý danh sách nhân viên không trùng
  const allMembers = new Set();
  department.assignedMembers?.forEach((member) => allMembers.add(member._id));
  department.tasks?.forEach((task) => {
    if (task.assignedMember?._id) {
      allMembers.add(task.assignedMember._id);
    }
  });

  const uniqueMembers =
    department.assignedMembers?.filter((member) =>
      allMembers.has(member._id)
    ) || [];

  const totalPages = Math.ceil(uniqueMembers.length / membersPerPage);
  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentMembers = uniqueMembers.slice(indexOfFirst, indexOfLast);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Phân trang dự án
  const totalProjectPages = Math.ceil(
    (department.projects?.length || 0) / projectsPerPage
  );
  const indexOfLastProject = currentProjectPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects =
    department.projects?.slice(indexOfFirstProject, indexOfLastProject) || [];

  const goToProjectPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalProjectPages) {
      setCurrentProjectPage(pageNumber);
    }
  };

  // Hàm lấy danh sách tasks cho từng nhân viên
  const getMemberTasks = (memberId) => {
    return (
      department.tasks?.filter(
        (task) =>
          task.assignedMember?._id === memberId && task.status !== "revoked"
      ) || []
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-800">
          Chi Tiết Phòng Ban
        </h1>

        {/* Basic Info */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Tên Phòng Ban
            </h2>
            <p>{department.name || "N/A"}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Mô Tả</h2>
            <p>{department.description || "N/A"}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Trưởng Phòng
            </h2>
            <p>{department.assignedLeader?.name || "Chưa có"}</p>
          </div>
        </section>

        {/* Members */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Danh Sách Nhân Viên
          </h2>
          {currentMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMembers.map((member, index) => {
                const memberTasks = getMemberTasks(member._id);
                return (
                  <div
                    key={member._id}
                    className="p-4 border rounded-lg shadow-sm bg-white"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-700 font-semibold">
                        {indexOfFirst + index + 1}.
                      </span>
                      <span className="text-gray-800 font-medium">
                        {member.name}
                      </span>
                    </div>
                    <div className="text-base text-gray-600">
                      <p className="font-semibold my-2">Công việc:</p>
                      {memberTasks.length > 0 ? (
                        <div className="space-y-2">
                          <ul className="list-disc pl-5">
                            {memberTasks.map((task) => (
                              <li key={task._id}>
                                <span className="font-medium">Nhiệm vụ: </span>
                                {task.name}
                              </li>
                            ))}
                          </ul>
                          <ul className="list-disc pl-5">
                            {memberTasks.map((task) => (
                              <li key={task._id + "-desc"}>
                                <span className="font-medium">Mô tả: </span>
                                {task.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>Chưa có công việc được giao.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Không có nhân viên.</p>
          )}

          {/* Pagination for Members */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Sau
              </button>
            </div>
          )}
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Danh Sách Dự Án
          </h2>
          {currentProjects.length > 0 ? (
            <div className="space-y-4">
              {currentProjects.map((project) => (
                <div
                  key={project._id}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50"
                >
                  <p className="font-medium text-blue-700 text-lg">
                    {project.name}
                  </p>
                  <p className="text-base text-gray-600">
                    Trạng thái: {project.status || "N/A"}
                  </p>
                  <p className="text-base text-gray-600">
                    Deadline:{" "}
                    {project.deadline && !isNaN(Date.parse(project.deadline))
                      ? new Date(project.deadline).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có dự án nào.</p>
          )}

          {/* Pagination for Projects */}
          {totalProjectPages > 1 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => goToProjectPage(currentProjectPage - 1)}
                disabled={currentProjectPage === 1}
                className={`px-3 py-1 rounded ${
                  currentProjectPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Trước
              </button>
              {[...Array(totalProjectPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToProjectPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentProjectPage === i + 1
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToProjectPage(currentProjectPage + 1)}
                disabled={currentProjectPage === totalProjectPages}
                className={`px-3 py-1 rounded ${
                  currentProjectPage === totalProjectPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Sau
              </button>
            </div>
          )}
        </section>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/departments")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay Lại Danh Sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;

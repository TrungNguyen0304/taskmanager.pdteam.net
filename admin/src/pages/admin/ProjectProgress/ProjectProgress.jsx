import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../../../data/projects";

const ProjectProgress = () => {
  const navigate = useNavigate();

  // Cuộn trang lên đầu khi component được render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleViewDetails = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "in-progress":
        return "Đang thực hiện";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
        Danh Sách Dự Án
      </h1>
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
              <tr>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Tên Dự Án</div>
                </th>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Mô Tả</div>
                </th>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Quản Lý</div>
                </th>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Trạng Thái</div>
                </th>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Đội Nhóm</div>
                </th>
                <th className="p-4 font-semibold text-sm md:text-base">
                  <div className="flex items-center gap-2">Hành Động</div>
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <td className="p-4 text-gray-900 font-medium">
                    {project.name}
                  </td>
                  <td className="p-4 text-gray-700">
                    {project.description || "Chưa có mô tả"}
                  </td>
                  <td className="p-4 text-gray-700">
                    {project.manager || "Chưa phân công"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">
                    {project.team || "Chưa phân nhóm"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewDetails(project.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all duration-300 shadow-sm"
                      aria-label={`Xem chi tiết ${project.name}`}
                    >
                      <span>Xem chi tiết</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;

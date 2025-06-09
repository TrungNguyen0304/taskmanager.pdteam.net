import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProjectProgress = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:8001/api/company/getassigned",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data.projects);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
    window.scrollTo(0, 0);
  }, []);

  const handleViewDetails = (projectId) => {
    navigate(`/projectprogress-detail/${projectId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
      case "in_progress":
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
      case "in_progress":
        return "Đang thực hiện";
      default:
        return "Không xác định";
    }
  };

  // Function to truncate description to 20 words
  const truncateDescription = (description) => {
    if (!description) return "Chưa có mô tả";
    const words = description.split(/\s+/);
    if (words.length > 20) {
      return words.slice(0, 20).join(" ") + "...";
    }
    return description;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-lg font-medium text-gray-600">
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-lg font-medium text-red-600">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4">
      <div className="mx-auto w-full">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl lg:text-4xl">
          Danh Sách Dự Án
        </h1>
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
                <tr>
                  <th className="w-[15%] px-4 py-3 text-sm font-semibold sm:text-base">
                    Tên Dự Án
                  </th>
                  <th className="w-[40%] px-4 py-3 text-sm font-semibold sm:text-base">
                    Mô Tả
                  </th>
                  <th className="w-[15%] px-4 py-3 text-sm font-semibold sm:text-base">
                    Trạng Thái
                  </th>
                  <th className="w-[15%] px-4 py-3 text-sm font-semibold sm:text-base">
                    Đội Nhóm
                  </th>
                  <th className="w-[15%] px-4 py-3 text-sm font-semibold sm:text-base">
                    Hành Động
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <td className="w-[15%] px-4 py-3 text-sm font-medium text-gray-900 sm:text-base">
                      {project.name}
                    </td>
                    <td className="w-[40%] px-4 py-3 text-sm text-gray-700 sm:text-base">
                      {truncateDescription(project.description)}
                    </td>
                    <td className="w-[15%] px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusText(project.status)}
                      </span>
                    </td>
                    <td className="w-[15%] px-4 py-3 text-sm text-gray-700 sm:text-base">
                      {project.assignedTeam?.name || "Chưa phân nhóm"}
                    </td>
                    <td className="w-[15%] px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(project._id)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:text-base"
                        aria-label={`Xem chi tiết ${project.name}`}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, FileText } from "lucide-react";
import { FaRegCalendarAlt, FaUsers, FaRegStickyNote } from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project, onViewReport }) => {
  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-md border border-gray-200 transition-shadow duration-300 p-6 md:p-8 cursor-default">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-800 flex items-center gap-2">
          {project.name}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => onViewReport(project.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition"
          >
            <FileText className="w-5 h-5" />
            Báo cáo
          </button>
          <button
            onClick={() =>
              (window.location.href = `/project-detail/${project.id}`)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
          >
            <Eye className="w-5 h-5" />
            Xem chi tiết
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 text-gray-700 text-base">
        <div className="md:w-2/3 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
              <FaRegStickyNote className="text-yellow-500" />
              Mô tả
            </div>
            <div
              className="whitespace-pre-line break-words"
              title={project.description}
            >
              {project.description || "Không có mô tả"}
            </div>
          </div>
        </div>

        <div className="md:w-1/3 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
              <FaRegCalendarAlt className="text-blue-500" />
              Deadline
            </div>
            <div>{project.deadline || "N/A"}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
              <MdOutlineAssignmentTurnedIn className="text-green-500" />
              Trạng thái
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                project.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : project.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
              <FaUsers className="text-purple-500" />
              Mã nhóm
            </div>
            <div>{project.teamId || "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 2; // Phân trang: 2 dự án mỗi trang
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/leader/showallProject",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (
          Array.isArray(response.data.projects) &&
          response.data.projects.length > 0
        ) {
          const formattedProjects = response.data.projects.map((p) => ({
            id: p._id,
            name: p.name || "N/A",
            description: p.description || "N/A",
            deadline: p.deadline
              ? new Date(p.deadline).toLocaleDateString("vi-VN")
              : "N/A",
            status: p.status || "N/A",
            teamId: p.teamId || "N/A",
          }));
          setProjects(formattedProjects);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dự án:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewReport = (id) => {
    navigate(`/project-report/${id}`);
  };

  // Calculate total pages and current projects to display
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full mx-auto mt-10">
        <p className="text-gray-600 font-medium text-center">
          Đang tải dữ liệu dự án...
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 w-full mx-auto mt-10">
        <p className="text-gray-500 text-center italic">
          Không có dự án để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="m-4">
      {/* Project Cards */}
      {currentProjects.map((project) => (
        <div key={project.id} className="mb-6">
          <ProjectCard project={project} onViewReport={handleViewReport} />
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-8 space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            } font-medium transition`}
          >
            Trước
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                } font-medium transition`}
              >
                {page}
              </button>
            )
          )}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            } font-medium transition`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;

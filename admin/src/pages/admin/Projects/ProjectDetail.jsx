import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProjectDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8001/api/company/viewTeamProject/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProject(data.project);
        } else {
          throw new Error(data.message || "Không thể tải dự án.");
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết dự án:", err);
        setError(err.message);
        alert(err.message || "Dự án không tồn tại!");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetail();
  }, [id, navigate]);

  // Priority mapping
  const getPriorityText = (priority) => {
    switch (priority) {
      case 3:
        return "Cao";
      case 2:
        return "Trung bình";
      case 1:
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  // Status mapping
  const getStatusText = (status) => {
    const statusMap = {
      pending: "Đang chờ",
      "in-progress": "Đang thực hiện",
      completed: "Hoàn thành",
      "on-hold": "Tạm dừng",
      cancelled: "Đã hủy",
    };
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-blue-600 animate-pulse">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-500">
          Dự án không tồn tại.
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Quay lại
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
            Chi Tiết Dự Án
          </h2>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Project Info */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <h3 className="text-xl font-semibold text-blue-600">
              Thông Tin Dự Án
            </h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-800">Tên Dự Án</h4>
                <p className="mt-1 text-base sm:text-lg">{project.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Mô Tả</h4>
                <p className="mt-1 text-base sm:text-lg whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Trạng Thái</h4>
                <p className="mt-1 text-base sm:text-lg">
                  {getStatusText(project.status)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Ưu Tiên</h4>
                <p className="mt-1 text-base sm:text-lg">
                  {getPriorityText(project.priority)}
                </p>
              </div>
              {project.createdAt &&
                !isNaN(new Date(project.createdAt).getTime()) && (
                  <div>
                    <h4 className="font-medium text-gray-800">Ngày Tạo</h4>
                    <p className="mt-1 text-base sm:text-lg">
                      {new Date(project.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}
              {project.deadline &&
                !isNaN(new Date(project.deadline).getTime()) && (
                  <div>
                    <h4 className="font-medium text-gray-800">Hạn Chót</h4>
                    <p className="mt-1 text-base sm:text-lg">
                      {new Date(project.deadline).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}
              <div>
                <h4 className="font-medium text-gray-800">Thông Báo Quá Hạn</h4>
                <p className="mt-1 text-base sm:text-lg">
                  {project.isOverdueNotified
                    ? "Đã thông báo"
                    : "Chưa thông báo"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Team Info */}
          {(project.assignedTeam?.assignedLeader?.name ||
            project.assignedTeam?.assignedMembers?.length > 0 ||
            project.assignedTeam?.name) && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <h3 className="text-xl font-semibold text-blue-600">
                Nhóm Phụ Trách
              </h3>
              <div className="space-y-4 text-gray-700">
                {project.assignedTeam?.name && (
                  <p className="text-base sm:text-lg">
                    <span className="font-medium">Phòng ban:</span>{" "}
                    {project.assignedTeam.name}
                  </p>
                )}
                {project.assignedTeam?.assignedLeader?.name && (
                  <p className="text-base sm:text-lg">
                    <span className="font-medium">Leader:</span>{" "}
                    {project.assignedTeam.assignedLeader.name}
                  </p>
                )}
                {project.assignedTeam?.assignedMembers?.length > 0 && (
                  <div>
                    <p className="text-base sm:text-lg font-medium">
                      Nhân viên:
                    </p>
                    <div className="mt-1">
                      {project.assignedTeam.assignedMembers.map((member) => (
                        <span
                          key={member._id}
                          className="block text-base sm:text-lg"
                        >
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">
            Danh Sách Công Việc
          </h3>
          {project.tasks?.length > 0 ? (
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <div
                  key={task._id}
                  className="border border-gray-200 rounded-md p-4 bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <h4 className="font-medium text-gray-800 text-base sm:text-lg">
                    {task.taskName}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    <span className="font-medium">Trạng thái:</span>{" "}
                    {task.status}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    <span className="font-medium">Người thực hiện:</span>{" "}
                    {task.assignee?.name || "Chưa phân công"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base sm:text-lg text-gray-500 italic">
              Chưa có công việc nào được thêm.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
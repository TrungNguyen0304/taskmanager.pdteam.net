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
          `https://apitaskmanager.pdteam.net/api/company/viewTeamProject/${id}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-red-600">
          Dự án không tồn tại.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-10 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Chi Tiết Dự Án
          </h2>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Project Info */}
          <div className="space-y-5 text-lg text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800">Tên Dự Án</h3>
              <p className="mt-1">{project.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Mô Tả</h3>
              <p className="mt-1 whitespace-pre-wrap">{project.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Trạng Thái</h3>
              <p className="mt-1 capitalize">{project.status}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Ưu Tiên</h3>
              <p className="mt-1">{project.priority}</p>
            </div>
            {/* Chỉ hiển thị Hạn Chót nếu deadline tồn tại và hợp lệ */}
            {project.deadline && !isNaN(new Date(project.deadline).getTime()) && (
              <div>
                <h3 className="font-semibold text-gray-800">Hạn Chót</h3>
                <p className="mt-1">
                  {new Date(project.deadline).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Team Info */}
          {(project.assignedTeam?.assignedLeader?.name ||
            project.assignedTeam?.assignedMembers?.length > 0 ||
            project.assignedTeam?.name) && (
              <div className="space-y-5 text-lg text-gray-700">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                  Nhóm Phụ Trách
                </h3>
                {project.assignedTeam?.assignedLeader?.name && (
                  <p>
                    <span className="font-medium">Leader:</span>{" "}
                    {project.assignedTeam.assignedLeader.name}
                  </p>
                )}
                {project.assignedTeam?.assignedMembers?.length > 0 && (
                  <p>
                    <span className="font-medium">Nhân viên:</span>{" "}
                    {project.assignedTeam.assignedMembers
                      .map((member) => member.name)
                      .join(", ")}
                  </p>
                )}
                {project.assignedTeam?.name && (
                  <p>
                    <span className="font-medium">Phòng ban:</span>{" "}
                    {project.assignedTeam.name}
                  </p>
                )}
              </div>
            )}
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh Sách Công Việc
          </h3>
          {project.tasks?.length > 0 ? (
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <div
                  key={task._id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-md transition"
                >
                  <h4 className="font-medium text-gray-900">{task.taskName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Trạng thái:</span>{" "}
                    {task.status}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Người thực hiện:</span>{" "}
                    {task.assignee?.name || "Chưa phân công"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base text-gray-500 italic">
              Chưa có công việc nào được thêm.
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="pt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

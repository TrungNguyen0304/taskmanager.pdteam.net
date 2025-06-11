import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";

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
      case 1:
        return <span className="text-red-600 font-medium">Cao</span>;
      case 2:
        return <span className="text-yellow-600 font-medium">Trung bình</span>;
      case 3:
        return <span className="text-green-600 font-medium">Thấp</span>;
      default:
        return <span className="text-gray-600">Không xác định</span>;
    }
  };

  // Status mapping
  const getStatusText = (status) => {
    const statusMap = {
      pending: <span className="text-gray-600">Đang chờ xử lý</span>,
      "in-progress": <span className="text-blue-600">Đang thực hiện</span>,
      completed: <span className="text-green-600">Hoàn thành</span>,
      "on-hold": <span className="text-yellow-600">Tạm dừng</span>,
      cancelled: <span className="text-red-600">Đã hủy</span>,
    };
    return (
      statusMap[status.toLowerCase()] || (
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      )
    );
  };

  // Format date with date-fns
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date)
      ? format(date, "HH:mm, dd/MM/yyyy", { locale: vi })
      : "Không xác định";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-semibold text-blue-600">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-500 mb-4">
            Dự án không tồn tại.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center mx-auto text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay về danh sách dự án
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-xl font-medium hover:underline text-blue-600 px-4 py-2 rounded-lg transition-colors duration-200"
            aria-label="Quay lại danh sách dự án"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
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
                  {project.description || "Chưa có mô tả."}
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
              {project.createdAt && (
                <div>
                  <h4 className="font-medium text-gray-800">Ngày Tạo</h4>
                  <p className="mt-1 text-base sm:text-lg">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              )}
              {project.deadline && (
                <div>
                  <h4 className="font-medium text-gray-800">Hạn Chót</h4>
                  <p className="mt-1 text-base sm:text-lg">
                    {formatDate(project.deadline)}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-800">Thông Báo Quá Hạn</h4>
                <p className="mt-1 text-base sm:text-lg">
                  {project.isOverdueNotified ? (
                    <span className="text-green-600">Đã thông báo</span>
                  ) : (
                    <span className="text-red-600">Chưa thông báo</span>
                  )}
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
                    <ul className="mt-1 list-disc list-inside">
                      {project.assignedTeam.assignedMembers.map((member) => (
                        <li key={member._id} className="text-base sm:text-lg">
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Users } from "lucide-react";
import { FaUserAlt } from "react-icons/fa";
import axios from "axios";

const PAGE_SIZE = 3;

const TeamMember = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/member/showallTeam",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.teams)) {
          const formatted = response.data.teams.map((team, index) => ({
            id: team.id || `team-${index}`,
            name: team.name || "N/A",
            assignedLeader: team.assignedLeader || "Chưa có trưởng nhóm",
            assignedMembers: Array.isArray(team.assignedMembers)
              ? team.assignedMembers.map((member) => member.name)
              : [],
          }));
          setTeams(formatted);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đội nhóm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const totalPages = Math.ceil(teams.length / PAGE_SIZE);
  const paginatedTeams = teams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/team-detail/${id}`);
  };

  return (
    <div className="w-full mx-auto p-0 md:p-4">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-white text-xs font-semibold">
                  {teams.length}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                Danh Sách Đội Nhóm
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Quản lý và theo dõi các đội nhóm của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-spin">
              <div className="absolute inset-1.5 rounded-full bg-white"></div>
            </div>
            <Users className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 text-base sm:text-lg font-medium">
              Đang tải dữ liệu...
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        </div>
      ) : paginatedTeams.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Không có đội nhóm nào
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Các đội nhóm sẽ hiển thị tại đây khi có dữ liệu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedTeams.map((team, index) => (
            <div
              key={team.id}
              className="group bg-white rounded-xl shadow-md border border-gray-100"
            >
              {/* Team Header */}
              <div className="bg-gray-50 p-4 sm:p-5 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-semibold">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                      {team.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Team Content */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center">
                      <FaUserAlt className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-yellow-900">
                      Trưởng nhóm
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
                    {team.assignedLeader}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-purple-900">
                      Thành viên
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                    {team.assignedMembers.length > 0
                      ? team.assignedMembers.join(", ")
                      : "Không có thành viên"}
                  </p>
                </div>

                <button
                  onClick={() => handleView(team.id)}
                  className="group flex items-center justify-center w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                  aria-label={`Xem chi tiết đội nhóm ${team.name}`}
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex justify-center items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 text-sm sm:text-base"
            aria-label="Trang trước"
          >
            Trước
          </button>
          <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-current={currentPage === idx + 1 ? "page" : undefined}
                aria-label={`Trang ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 text-sm sm:text-base"
            aria-label="Trang sau"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamMember;

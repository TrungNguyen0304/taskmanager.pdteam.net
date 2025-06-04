import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Users } from "lucide-react";
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
    <div className="w-full mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Danh sách đội nhóm
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : paginatedTeams.length === 0 ? (
        <p className="text-gray-500">Không có đội nhóm nào.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {paginatedTeams.map((team, index) => (
            <div
              key={team.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {team.name}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  #{(currentPage - 1) * PAGE_SIZE + index + 1}
                </span>
              </div>

              <p className="text-gray-600 mb-1">
                <strong>Trưởng nhóm:</strong> {team.assignedLeader}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Thành viên:</strong>{" "}
                {team.assignedMembers.length > 0
                  ? team.assignedMembers.join(", ")
                  : "Không có thành viên"}
              </p>

              <button
                onClick={() => handleView(team.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
              >
                <Eye className="w-5 h-5" />
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center md:justify-end mt-8 flex-wrap gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-4 py-1.5 rounded border text-sm font-medium ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-white hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMember;

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Eye } from "lucide-react";
import axios from "axios";

const TeamTable = ({ title = "Danh Sách Nhóm", originPage = "team" }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/leader/showallTeam",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data.teams)) {
          const formattedTeams = response.data.teams.map((team, index) => ({
            id: team.id || `team-${index}`,
            name: team.name || "N/A",
            leader: team.assignedLeader || "N/A",
            memberCount: team.assignedMembers ? team.assignedMembers.length : 0,
            members: team.assignedMembers
              ? team.assignedMembers.map((memberName, idx) => ({
                  id: `member-${index}-${idx}`,
                  name: memberName || "N/A",
                }))
              : [],
          }));
          setTeams(formattedTeams);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        alert("Lỗi khi lấy dữ liệu nhóm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(teams.length / PAGE_SIZE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (teams.length === 0) {
      setCurrentPage(1);
    }
  }, [teams, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(teams.length / PAGE_SIZE);
  const paginatedTeams = teams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full mx-auto">
        <p>Đang tải dữ liệu nhóm...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f6f7fb] rounded-2xl shadow-md w-full mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#323338] flex items-center gap-2">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#cce5ff] rounded-xl text-[#323338] text-base">
              <th className="w-[25%] px-4 py-3">Tên Nhóm</th>
              <th className="w-[25%] px-4 py-3">Trưởng Nhóm</th>
              <th className="w-[20%] px-4 py-3">Số Thành Viên</th>
              <th className="w-[20%] px-4 py-3 rounded-r-xl">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeams.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-gray-500 bg-white rounded-xl shadow"
                >
                  Không có dữ liệu nhóm.
                </td>
              </tr>
            ) : (
              paginatedTeams.map((team, index) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
                return (
                  <tr
                    key={team.id}
                    className="bg-white rounded-xl shadow transition text-center"
                  >
                    <td className="px-4 py-3 text-[#323338]">{team.name}</td>
                    <td className="px-4 py-3 text-[#676879]">{team.leader}</td>
                    <td className="px-4 py-3 text-[#676879]">
                      {team.memberCount}
                    </td>
                    <td className="px-4 py-3 rounded-r-xl">
                      <NavLink
                        to={`/team-detail/${team.id}`}
                        state={{ index, originPage }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow hover:bg-blue-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </NavLink>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-6 flex-wrap gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#009aff] text-white hover:bg-[#0077c2]"
            }`}
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === page
                  ? "bg-gradient-to-r from-[#009aff] to-[#1d557a] text-white shadow"
                  : "bg-white text-[#323338] border border-gray-200 hover:bg-[#eaf1fb]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#009aff] text-white hover:bg-[#0077c2]"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamTable;

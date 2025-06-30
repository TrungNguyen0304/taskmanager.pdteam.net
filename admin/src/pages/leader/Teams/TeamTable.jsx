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
          "https://apitaskmanager.pdteam.net/api/leader/showallTeam",
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

  const handlePageChange = (page) => setCurrentPage(page);

  const totalPages = Math.ceil(teams.length / PAGE_SIZE);
  const paginatedTeams = teams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg w-full mx-auto max-w-7xl">
        <p className="text-center text-gray-500 animate-pulse">
          Đang tải dữ liệu nhóm...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl w-full mx-auto ring‑1 ring-gray-200">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
          {title}
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate [border-spacing:0_8px] text-sm sm:text-base">
          <thead>
            <tr className="h-12 bg-gradient-to-r from-[#e6f3ff] to-[#f3fcff] text-blue-700 uppercase tracking-wide text-sm sm:text-base rounded-xl shadow-sm">
              <th className="w-[30%] px-4 text-left sm:text-center rounded-l-xl">
                Tên Nhóm
              </th>
              <th className="hidden sm:table-cell w-[20%] px-4 text-center">
                Trưởng Nhóm
              </th>
              <th className="hidden sm:table-cell w-[20%] px-4 text-center">
                Thành Viên
              </th>
              <th className="w-[30%] px-4 text-center rounded-r-xl">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeams.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-gray-500 bg-white rounded-xl shadow"
                >
                  Không có dữ liệu nhóm.
                </td>
              </tr>
            ) : (
              paginatedTeams.map((team, index) => (
                <tr
                  key={team.id}
                  className="bg-white even:bg-[#f7fbff] hover:bg-[#eaf4ff] rounded-xl shadow transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-[#323338] text-left sm:text-center">
                    <div className="flex flex-col items-start sm:items-center gap-0.5">
                      <span className="font-medium truncate max-w-[12rem] sm:max-w-full text-base">
                        {team.name}
                      </span>
                      <span className="sm:hidden text-sm text-gray-500">
                        Trưởng nhóm: {team.leader}
                      </span>
                      <span className="sm:hidden text-sm text-gray-500">
                        Thành viên: {team.memberCount}
                      </span>
                    </div>
                  </td>

                  <td className="hidden sm:table-cell px-4 py-3 text-[#676879] text-center truncate max-w-[8rem]">
                    {team.leader}
                  </td>

                  <td className="hidden sm:table-cell px-4 py-3 text-[#676879] text-center">
                    {team.memberCount}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <NavLink
                      to={`/team-detail/${team.id}`}
                      state={{ index, originPage }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium shadow hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring‑2 focus:ring-offset-2 focus:ring-sky-500 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden md:inline">Xem chi tiết</span>
                    </NavLink>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end mt-8 flex-wrap gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base shadow transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 disabled:from-gray-100 disabled:to-gray-100`}
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base shadow transition ${
                currentPage === page
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                  : "bg-white text-[#323338] border border-gray-200 hover:bg-[#eaf1fb]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base shadow transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 disabled:from-gray-100 disabled:to-gray-100`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamTable;

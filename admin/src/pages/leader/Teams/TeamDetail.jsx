import React from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";

const TeamDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { team, index, originPage } = location.state || {};

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-red-600 text-lg font-semibold">
            Không tìm thấy thông tin nhóm.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="w-full mx-auto bg-white rounded-3xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Quay lại
          </button>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">
            Thông Tin Chi Tiết Nhóm
          </h1>
          <div /> {/* để cân bằng flex */}
        </div>

        {/* Thông tin nhóm */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-100 rounded-lg p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
              Tên Nhóm
            </p>
            <p className="text-lg font-medium text-gray-900 truncate">
              {team.name}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
              Trưởng Nhóm
            </p>
            <p className="text-lg font-medium text-gray-900 truncate">
              {team.leader}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
              Số Thành Viên
            </p>
            <p className="text-lg font-medium text-gray-900">
              {team.memberCount}
            </p>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh Sách Thành Viên
          </h2>

          {team.members && team.members.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gradient-to-r from-[#00A9FF] to-[#0077FF] text-white">
                  <tr>
                    <th className="px-6 py-3 text-center font-semibold uppercase text-sm">
                      STT
                    </th>
                    <th className="px-6 py-3 text-center font-semibold uppercase text-sm">
                      Tên Thành Viên
                    </th>
                    <th className="px-6 py-3 text-center font-semibold uppercase text-sm">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((member, idx) => (
                    <tr
                      key={member.id}
                      className="border-t border-gray-200 hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-3 text-gray-700 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900 text-center">
                        {member.name}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <NavLink
                          to="/member-detail"
                          state={{ member, team, index }}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 rounded text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-5 h-5" />
                          Xem chi tiết
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Không có thành viên nào trong nhóm.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamDetail;

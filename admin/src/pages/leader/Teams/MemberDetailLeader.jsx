import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MemberDetailLeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { member, team, index } = location.state || {};

  if (!member || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-center text-red-600 font-medium">
            Không tìm thấy thông tin thành viên hoặc nhóm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Chi Tiết Thành Viên
          </h2>
        </div>

        {/* Member Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#f0f4ff] rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-500 font-medium">Tên</p>
            <p className="text-base font-semibold text-gray-800">
              {member.name}
            </p>
          </div>

          <div className="bg-[#f0f4ff] rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-500 font-medium">ID Thành Viên</p>
            <p className="text-base font-semibold text-gray-800">
              {member.id}
            </p>
          </div>

          <div className="bg-[#f0f4ff] rounded-xl p-4 border border-blue-100 col-span-full">
            <p className="text-sm text-gray-500 font-medium">Nhóm</p>
            <p className="text-base font-semibold text-gray-800">
              {team.name} (ID: {index})
            </p>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Danh Sách Dự Án
          </h3>
          <p className="text-sm text-gray-500">
            Không có dữ liệu dự án cho thành viên này.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailLeader;

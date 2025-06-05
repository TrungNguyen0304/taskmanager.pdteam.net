import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

const TeamDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { team: initialTeam, index, originPage } = location.state || {};
  const [team, setTeam] = useState(initialTeam);
  const [loading, setLoading] = useState(!initialTeam);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialTeam && id) {
      const fetchTeam = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:8001/api/leader/viewTeam/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await response.json();
          if (data.message === "Lấy thông tin team thành công.") {
            setTeam(data.team);
          } else {
            setError("Không thể tải thông tin nhóm.");
          }
        } catch (err) {
          setError("Lỗi khi tải dữ liệu nhóm.");
        } finally {
          setLoading(false);
        }
      };
      fetchTeam();
    }
  }, [id, initialTeam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg font-medium">
            Đang tải thông tin nhóm...
          </p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl sm:text-2xl">⚠</span>
          </div>
          <p className="text-red-600 text-base sm:text-lg font-semibold mb-4">
            {error || "Không tìm thấy thông tin nhóm."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-2 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:underline text-base sm:text-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Quay lại</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thông Tin Chi Tiết Nhóm
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Quản lý và theo dõi thành viên
            </p>
          </div>

          <div className="w-0 sm:w-20"></div>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 space-y-3 sm:space-y-0">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tên Nhóm
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 truncate">
                {team.name}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                Trưởng Nhóm
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 truncate">
                {team.leader || "Chưa chỉ định"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 font-bold text-base sm:text-lg">
                {team.assignedMembers?.length || 0}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                Số Thành Viên
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                {team.assignedMembers?.length || 0} người
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Danh Sách Thành Viên
          </h2>
        </div>

        {team.assignedMembers && team.assignedMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {team.assignedMembers.map((member, idx) => (
              <div
                key={member._id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                      {member.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{member.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{member.phoneNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {member.gender === 0 ? "Nam" : "Nữ"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(member.dateOfBirth).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed line-clamp-2">
                      {member.address}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              Không có thành viên nào trong nhóm
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Hãy thêm thành viên để bắt đầu làm việc
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
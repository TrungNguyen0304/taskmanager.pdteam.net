import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, User, Briefcase } from "lucide-react";
import axios from "axios";

const TeamDetailMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/member/viewTeam/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTeam(response.data.team);
      } catch (err) {
        setError("Không thể tải thông tin đội nhóm.");
        console.error("Lỗi khi tải chi tiết đội nhóm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg animate-pulse">
        <p className="text-gray-500 text-center text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="w-full mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg">
        <p className="text-red-500 text-center text-lg font-semibold">{error || "Không tìm thấy đội nhóm."}</p>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Chi tiết đội nhóm</h2>
      </div>

      <div className="space-y-8">
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{team.name}</h3>
              <p className="text-gray-600 text-sm">{team.description}</p>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <User className="w-5 h-5" />
            Trưởng nhóm
          </h4>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 font-medium">{team.assignedLeader.name}</p>
            <p className="text-gray-600 text-sm">{team.assignedLeader.email}</p>
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            Thành viên
          </h4>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            {team.assignedMembers.length > 0 ? (
              <ul className="space-y-2 text-gray-700">
                {team.assignedMembers.map((member) => (
                  <li key={member._id} className="border-b pb-2 last:border-none last:pb-0">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Không có thành viên.</p>
            )}
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5" />
            Dự án
          </h4>
          {team.projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {team.projects.map((project) => (
                <div
                  key={project._id}
                  className="border border-gray-200 bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <h5 className="text-lg font-semibold text-gray-900">{project.name}</h5>
                  <p className="text-gray-600 mb-2">{project.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {project.status === "pending" ? "Đang chờ" : project.status}
                    </p>
                    <p>
                      <span className="font-medium">Hạn chót:</span>{" "}
                      {new Date(project.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Không có dự án nào.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamDetailMember;

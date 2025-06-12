import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AlertCircle, Users, Briefcase, FileText, Star } from "lucide-react";
import axios from "axios";

const HomeLeader = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for charts
  const COLORS = ["#FF6384", "#36A2EB", "#4BC0C0", "#FFCE56", "#9966FF"];

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8001/api/leader/getStatistics",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStatistics(response.data.statistics);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê");
      console.error("Lỗi khi lấy thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-100 rounded mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-72 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="text-center text-red-500">
          <AlertCircle className="mx-auto mb-3" size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const taskStatusData =
    statistics?.chartData?.taskStatus?.data?.labels?.map((label, index) => ({
      name:
        label === "Pending"
          ? "Chờ xử lý"
          : label === "In Progress"
          ? "Đang thực hiện"
          : label === "Completed"
          ? "Hoàn thành"
          : label === "Cancelled"
          ? "Đã hủy"
          : label,
      value:
        statistics?.chartData?.taskStatus?.data?.datasets[0]?.data[index] || 0,
      color: COLORS[index % COLORS.length],
    })) || [];

  const reportStatusData =
    statistics?.chartData?.reports?.data?.labels?.map((label, index) => ({
      name:
        label === "Evaluated"
          ? "Đã đánh giá"
          : label === "Unevaluated"
          ? "Chưa đánh giá"
          : label,
      value:
        statistics?.chartData?.reports?.data?.datasets[0]?.data[index] || 0,
      color: COLORS[index % COLORS.length],
    })) || [];

  const teamMembersData =
    statistics?.chartData?.teamMembers?.data?.labels?.map((label, index) => ({
      name: label,
      members:
        statistics?.chartData?.teamMembers?.data?.datasets[0]?.data[index] || 0,
    })) || [];

  const taskAssignmentData =
    statistics?.chartData?.taskAssignment?.data?.labels?.map(
      (label, index) => ({
        name: label,
        assigned:
          statistics?.chartData?.taskAssignment?.data?.datasets[0]?.data[
            index
          ] || 0,
        unassigned:
          statistics?.chartData?.taskAssignment?.data?.datasets[1]?.data[
            index
          ] || 0,
      })
    ) || [];

  // Custom label renderer for pie chart to prevent overlap
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    value,
    name,
  }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? "start" : "end";
    const truncatedName = name.length > 10 ? `${name.slice(0, 10)}...` : name;

    return (
      <text
        x={x}
        y={y}
        fill="#1F2937"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${truncatedName}: ${value}`}
      </text>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 w-full mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bảng Điều Khiển Trưởng Nhóm
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Tổng quan về hiệu suất đội nhóm của bạn
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Nhiệm Vụ</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.values(statistics?.taskStatus || {}).reduce(
                  (sum, count) => sum + count,
                  0
                )}
              </p>
            </div>
            <Briefcase className="text-blue-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Thành Viên</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.teamMembers?.reduce(
                  (sum, team) => sum + team.memberCount,
                  0
                ) || 0}
              </p>
            </div>
            <Users className="text-green-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Báo Cáo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.reports?.total || 0}
              </p>
            </div>
            <FileText className="text-orange-500" size={28} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Phân Bố Trạng Thái Nhiệm Vụ
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={true}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Report Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Trạng Thái Đánh Giá Báo Cáo
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={reportStatusData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={true}
              >
                {reportStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Số Lượng Thành Viên Theo Nhóm
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamMembersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [value, "Thành viên"]} />
            <Legend formatter={() => "Thành viên"} />
            <Bar dataKey="members" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task Assignment Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Phân Bố Nhiệm Vụ Đã/Chưa Giao Theo Dự Án
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskAssignmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [
                value,
                name === "assigned" ? "Đã giao" : "Chưa giao",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "assigned" ? "Đã giao" : "Chưa giao"
              }
            />
            <Bar dataKey="assigned" fill={COLORS[1]} />
            <Bar dataKey="unassigned" fill={COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Summary Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Báo Cáo Nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Tiến Độ Dự Án
            </h4>
            <div className="space-y-2 text-sm">
              {statistics?.projectProgress?.map((project, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{project.projectName}:</span>
                  <span className="font-medium">
                    {project.averageProgress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Báo Cáo Thành Viên
            </h4>
            <div className="space-y-2 text-sm">
              {statistics?.memberReports?.map((member, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{member.memberName}:</span>
                  <span className="font-medium">{member.reportCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Hiệu Suất Nhóm
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng nhiệm vụ đã giao:</span>
                <span className="font-medium">
                  {statistics?.assignedTasks?.reduce(
                    (sum, task) => sum + task.assignedCount,
                    0
                  ) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng nhiệm vụ chưa giao:</span>
                <span className="font-medium">
                  {statistics?.unassignedTasks?.reduce(
                    (sum, task) => sum + task.unassignedCount,
                    0
                  ) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phản hồi nhận được:</span>
                <span className="font-medium">
                  {statistics?.feedbacks?.total || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLeader;

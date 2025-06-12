import React, { useState, useEffect } from "react";
import { BarChart, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Bar } from "recharts";
import { CheckCircle, AlertCircle, TrendingUp, FileText, Star } from "lucide-react";
import axios from "axios";

const HomeMember = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for charts
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8001/api/member/getMemberStatistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStatistics(response.data.statistics);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
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

  // Prepare chart data from API response
  const taskStatusData = statistics?.chartData?.taskStatus?.data?.labels?.map((label, index) => ({
    name: label === "Pending" ? "Chờ xử lý" : 
          label === "In Progress" ? "Đang thực hiện" : 
          label === "Completed" ? "Hoàn thành" : 
          label === "Cancelled" ? "Đã hủy" : label,
    value: statistics?.chartData?.taskStatus?.data?.datasets[0]?.data[index] || 0,
    color: COLORS[index % COLORS.length],
  })) || [];

  const reportStatusData = statistics?.chartData?.reportStats?.data?.labels?.map((label, index) => ({
    name: label === "Evaluated" ? "Đã đánh giá" : 
          label === "Unevaluated" ? "Chưa đánh giá" : label,
    value: statistics?.chartData?.reportStats?.data?.datasets[0]?.data[index] || 0,
    color: COLORS[index % COLORS.length],
  })) || [];

  const projectTaskData = statistics?.chartData?.projectTaskCount?.data?.labels?.map((label, index) => ({
    name: label,
    tasks: statistics?.chartData?.projectTaskCount?.data?.datasets[0]?.data[index] || 0,
  })) || [];

  const totalTasks = Object.values(statistics?.taskStatus || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-6 p-2 sm:p-4 w-full mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bảng Điều Khiển Thành Viên
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Chào mừng bạn đến với hệ thống quản lý nhân sự!
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Nhiệm Vụ</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
            </div>
            <CheckCircle className="text-blue-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nhiệm Vụ Hoàn Thành</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.taskStatus?.completed || 0}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Báo Cáo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.reportStats?.total || 0}
              </p>
            </div>
            <FileText className="text-orange-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Điểm Trung Bình</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.feedbackStats?.averageScore || 0}
              </p>
            </div>
            <Star className="text-purple-500" size={28} />
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
                label={({ name, value }) => `${name}: ${value}`}
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
                label={({ name, value }) => `${name}: ${value}`}
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

      {/* Project Task Count Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Số Lượng Nhiệm Vụ Theo Dự Án
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectTaskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [value, "Nhiệm vụ"]} />
            <Legend formatter={() => "Nhiệm vụ"} />
            <Bar dataKey="tasks" fill={COLORS[0]} />
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
            <h4 className="text-base font-medium text-gray-900 mb-3">Tiến Độ Nhiệm Vụ</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hoàn thành:</span>
                <span className="font-medium">{statistics?.taskStatus?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đang thực hiện:</span>
                <span className="font-medium">{statistics?.taskStatus?.in_progress || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chờ xử lý:</span>
                <span className="font-medium">{statistics?.taskStatus?.pending || 0}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">Trạng Thái Báo Cáo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng báo cáo:</span>
                <span className="font-medium">{statistics?.reportStats?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã đánh giá:</span>
                <span className="font-medium">{statistics?.reportStats?.evaluated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chưa đánh giá:</span>
                <span className="font-medium">{statistics?.reportStats?.unevaluated || 0}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">Hiệu Suất</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phản hồi nhận được:</span>
                <span className="font-medium">{statistics?.feedbackStats?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm trung bình:</span>
                <span className="font-medium">{statistics?.feedbackStats?.averageScore || 0}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                <span className="font-medium">
                  {totalTasks > 0
                    ? Math.round(((statistics?.taskStatus?.completed || 0) / totalTasks) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMember;
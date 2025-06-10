import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const HomeLeader = () => {
  const [statistics, setStatistics] = useState(null);
  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Fetch statistics from API
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/leader/getStatistics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (data.message === "Thống kê thành công.") {
          setStatistics(data.statistics);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStatistics();
  }, []);

  // Pagination logic
  const paginate = (data, page) => data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderPagination = (total, currentPage, setPage) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setPage(currentPage - 1)}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
        >
          Trước
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-4 py-2 rounded-full border border-gray-300 ${
            currentPage === i
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
          } transition-all duration-300`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setPage(currentPage + 1)}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
        >
          Sau
        </button>
      );
    }

    return <div className="flex flex-wrap gap-2 mt-6 justify-end">{pages}</div>;
  };

  if (!statistics) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  // Combine assigned and unassigned tasks for table display
  const taskAssignmentData = statistics.assignedTasks.map((assigned) => ({
    projectId: assigned.projectId,
    projectName: assigned.projectName,
    assignedCount: assigned.assignedCount || 0,
    unassignedCount:
      statistics.unassignedTasks.find((u) => u.projectId.toString() === assigned.projectId.toString())
        ?.unassignedCount || 0,
  }));

  return (
    <div className="p-6 md:p-10 lg:p-12 space-y-10 w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Trang Chủ Leader</h2>
        <div className="text-sm text-gray-500 italic">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Tổng Nhân Viên", value: statistics.teamMembers.reduce((sum, team) => sum + team.memberCount, 0), icon: "👥" },
          { title: "Nhiệm Vụ Hoàn Thành", value: statistics.taskStatus.completed, icon: "✅" },
          { title: "Báo Cáo Chưa Đánh Giá", value: statistics.reports.unevaluated, icon: "📝" },
          { title: "Dự Án Đang Thực Hiện", value: statistics.projectProgress.length, icon: "🚀" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
            <span className="text-3xl mb-2">{item.icon}</span>
            <p className="text-4xl font-bold text-indigo-600">{item.value}</p>
            <h3 className="text-base font-semibold text-gray-700 mt-2">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Phân Bố Trạng Thái Nhiệm Vụ</h3>
          <div className="h-[350px] relative">
            <Pie data={statistics.chartData.taskStatus.data} options={{
              ...statistics.chartData.taskStatus.options,
              plugins: {
                ...statistics.chartData.taskStatus.options.plugins,
                legend: { position: 'right', labels: { boxWidth: 20, padding: 20 } },
              },
            }} />
          </div>
        </div>

        {/* Team Members Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Số Lượng Thành Viên Mỗi Team</h3>
          <div className="h-[350px] relative">
            <Bar data={statistics.chartData.teamMembers.data} options={{
              ...statistics.chartData.teamMembers.options,
              plugins: {
                ...statistics.chartData.teamMembers.options.plugins,
                legend: { position: 'top', labels: { boxWidth: 20, padding: 20 } },
              },
            }} />
          </div>
        </div>

        {/* Report Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Trạng Thái Đánh Giá Báo Cáo</h3>
          <div className="h-[350px] relative">
            <Pie data={statistics.chartData.reports.data} options={{
              ...statistics.chartData.reports.options,
              plugins: {
                ...statistics.chartData.reports.options.plugins,
                legend: { position: 'right', labels: { boxWidth: 20, padding: 20 } },
              },
            }} />
          </div>
        </div>

        {/* Task Assignment Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Phân Bố Task Đã/Chưa Giao</h3>
          <div className="h-[350px] relative">
            <Bar data={statistics.chartData.taskAssignment.data} options={{
              ...statistics.chartData.taskAssignment.options,
              plugins: {
                ...statistics.chartData.taskAssignment.options.plugins,
                legend: { position: 'top', labels: { boxWidth: 20, padding: 20 } },
              },
            }} />
          </div>
        </div>

        {/* Project Progress Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tiến Độ Dự Án</h3>
          <div className="h-[350px] relative">
            <Bar
              data={{
                labels: statistics.projectProgress.map((proj) => proj.projectName),
                datasets: [
                  {
                    label: "Tiến Độ Trung Bình (%)",
                    data: statistics.projectProgress.map((proj) => proj.averageProgress),
                    backgroundColor: "#4F46E5",
                    borderColor: "#4F46E5",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top", labels: { boxWidth: 20, padding: 20 } },
                  title: { display: true, text: "Tiến Độ Trung Bình Các Dự Án", font: { size: 16 } },
                },
                scales: {
                  y: { beginAtZero: true, max: 100, title: { display: true, text: "Tiến Độ (%)" } },
                  x: { title: { display: true, text: "Dự Án" } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="space-y-10">
        {/* Member Reports Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Báo Cáo Của Thành Viên</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50 text-left text-gray-700">
                  <th className="p-4 border-b font-semibold">ID Thành Viên</th>
                  <th className="p-4 border-b font-semibold">Tên Thành Viên</th>
                  <th className="p-4 border-b font-semibold">Số Báo Cáo</th>
                </tr>
              </thead>
              <tbody>
                {paginate(statistics.memberReports, taskPage).map((report) => (
                  <tr key={report.memberId} className="hover:bg-indigo-50/50 transition-all duration-200">
                    <td className="p-4 border-b text-gray-600">{report.memberId}</td>
                    <td className="p-4 border-b text-gray-600">{report.memberName}</td>
                    <td className="p-4 border-b text-gray-600">{report.reportCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(statistics.memberReports.length, taskPage, setTaskPage)}
        </div>

        {/* Project Progress Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dự Án Mới Nhất</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50 text-left text-gray-700">
                  <th className="p-4 border-b font-semibold">ID Dự Án</th>
                  <th className="p-4 border-b font-semibold">Tên Dự Án</th>
                  <th className="p-4 border-b font-semibold">Tiến Độ Trung Bình (%)</th>
                  <th className="p-4 border-b font-semibold">Tổng Nhiệm Vụ</th>
                </tr>
              </thead>
              <tbody>
                {paginate(statistics.projectProgress, projectPage).map((project) => (
                  <tr key={project.projectId} className="hover:bg-indigo-50/50 transition-all duration-200">
                    <td className="p-4 border-b text-gray-600">{project.projectId}</td>
                    <td className="p-4 border-b text-gray-600">{project.projectName}</td>
                    <td className="p-4

 border-b text-gray-600">{project.averageProgress}%</td>
                    <td className="p-4 border-b text-gray-600">{project.totalTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(statistics.projectProgress.length, projectPage, setProjectPage)}
        </div>

        {/* Task Assignment Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Phân Bố Nhiệm Vụ Đã/Chưa Giao</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50 text-left text-gray-700">
                  <th className="p-4 border-b font-semibold">ID Dự Án</th>
                  <th className="p-4 border-b font-semibold">Tên Dự Án</th>
                  <th className="p-4 border-b font-semibold">Nhiệm Vụ Đã Giao</th>
                  <th className="p-4 border-b font-semibold">Nhiệm Vụ Chưa Giao</th>
                </tr>
              </thead>
              <tbody>
                {paginate(taskAssignmentData, assignmentPage).map((project) => (
                  <tr key={project.projectId} className="hover:bg-indigo-50/50 transition-all duration-200">
                    <td className="p-4 border-b text-gray-600">{project.projectId}</td>
                    <td className="p-4 border-b text-gray-600">{project.projectName}</td>
                    <td className="p-4 border-b text-gray-600">{project.assignedCount}</td>
                    <td className="p-4 border-b text-gray-600">{project.unassignedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(taskAssignmentData.length, assignmentPage, setAssignmentPage)}
        </div>
      </div>
    </div>
  );
};

export default HomeLeader;
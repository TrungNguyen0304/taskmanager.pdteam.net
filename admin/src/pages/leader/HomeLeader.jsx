import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const HomeLeader = () => {
  const chartData = [
    { month: "T1", daGiao: 5, chuaGiao: 3 },
    { month: "T2", daGiao: 8, chuaGiao: 4 },
    { month: "T3", daGiao: 12, chuaGiao: 6 },
    { month: "T4", daGiao: 15, chuaGiao: 3 },
    { month: "T5", daGiao: 18, chuaGiao: 5 },
  ];

  const PAGE_SIZE = 3;

  const tasks = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Nhiệm vụ ${i + 1}`,
    status: i % 2 === 0 ? "Đã giao" : "Chưa giao",
    deadline: "2025-06-01",
  }));

  const projects = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Dự án ${i + 1}`,
    status: i % 3 === 0 ? "Đang thực hiện" : "Tạm dừng",
    updatedAt: "2025-05-23",
  }));

  const [taskPage, setTaskPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  const paginate = (data, page) =>
    data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-100"
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
          className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 rounded border ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-100"
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
          className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-100"
        >
          Sau
        </button>
      );
    }

    return <div className="flex flex-wrap gap-2 mt-4 justify-end">{pages}</div>;
  };

  return (
    <div className="p-2 md:p-4 space-y-6 w-full mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Trang Chủ Leader
        </h2>
      </div>

      {/* Thẻ tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Tổng Nhân Viên", value: 42 },
          { title: "Nhiệm Vụ Đã Giao", value: 24 },
          { title: "Nhiệm Vụ Chưa Giao", value: 18 },
          { title: "Dự Án Đang Thực Hiện", value: 6 },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-2xl font-bold text-blue-600">{item.value}</p>
            <h3 className="text-sm md:text-base font-semibold text-gray-700">
              {item.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
          Biểu Đồ Nhiệm Vụ Theo Tháng
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="daGiao"
                stroke="#1D4ED8"
                name="Đã Giao"
              />
              <Line
                type="monotone"
                dataKey="chuaGiao"
                stroke="#F59E0B"
                name="Chưa Giao"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nhiệm vụ gần nhất */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
          Nhiệm Vụ Gần Nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Tên Nhiệm Vụ</th>
                <th className="p-2 border">Trạng Thái</th>
                <th className="p-2 border">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {paginate(tasks, taskPage).map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{task.id}</td>
                  <td className="p-2 border">{task.name}</td>
                  <td className="p-2 border">{task.status}</td>
                  <td className="p-2 border">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(tasks.length, taskPage, setTaskPage)}
      </div>

      {/* Dự án mới nhất */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
          Dự Án Mới Nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Tên Dự Án</th>
                <th className="p-2 border">Trạng Thái</th>
                <th className="p-2 border">Cập Nhật</th>
              </tr>
            </thead>
            <tbody>
              {paginate(projects, projectPage).map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{project.id}</td>
                  <td className="p-2 border">{project.name}</td>
                  <td className="p-2 border">{project.status}</td>
                  <td className="p-2 border">{project.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(projects.length, projectPage, setProjectPage)}
      </div>
    </div>
  );
};

export default HomeLeader;

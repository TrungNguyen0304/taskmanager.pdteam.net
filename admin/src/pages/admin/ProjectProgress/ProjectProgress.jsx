import React, { useState } from "react";

// Sample project data (giữ nguyên)
const projects = [
  {
    id: 1,
    name: "Dự án A",
    startDate: "2025-05-01",
    endDate: "2025-06-15",
    description: "Phát triển ứng dụng web quản lý khách hàng",
    status: "Đang thực hiện",
    manager: "Nguyễn Văn A",
    team: "Frontend Team",
    tasks: [
      {
        id: 1,
        name: "Phân tích yêu cầu",
        start: "2025-05-01",
        end: "2025-05-10",
        progress: 100,
        assignee: "Business Analyst",
        priority: "Cao",
      },
      {
        id: 2,
        name: "Thiết kế giao diện",
        start: "2025-05-11",
        end: "2025-05-20",
        progress: 80,
        assignee: "UI/UX Designer",
        priority: "Cao",
      },
      {
        id: 3,
        name: "Phát triển backend",
        start: "2025-05-21",
        end: "2025-06-05",
        progress: 50,
        assignee: "Backend Developer",
        priority: "Trung bình",
      },
      {
        id: 4,
        name: "Kiểm thử",
        start: "2025-06-06",
        end: "2025-06-15",
        progress: 20,
        assignee: "QA Tester",
        priority: "Cao",
      },
      {
        id: 5,
        name: "Kiểm thử",
        start: "2025-06-06",
        end: "2025-06-15",
        progress: 20,
        assignee: "QA Tester",
        priority: "Cao",
      },
      {
        id: 6,
        name: "Kiểm thử",
        start: "2025-06-06",
        end: "2025-06-15",
        progress: 20,
        assignee: "QA Tester",
        priority: "Cao",
      },
    ],
  },
  {
    id: 2,
    name: "Dự án B",
    startDate: "2025-05-10",
    endDate: "2025-07-01",
    description: "Xây dựng hệ thống API cho mobile app",
    status: "Đang thực hiện",
    manager: "Trần Thị B",
    team: "Backend Team",
    tasks: [
      {
        id: 1,
        name: "Lập kế hoạch",
        start: "2025-05-10",
        end: "2025-05-15",
        progress: 100,
        assignee: "Project Manager",
        priority: "Cao",
      },
      {
        id: 2,
        name: "Phát triển API",
        start: "2025-05-16",
        end: "2025-06-10",
        progress: 60,
        assignee: "API Developer",
        priority: "Cao",
      },
      {
        id: 3,
        name: "Tích hợp hệ thống",
        start: "2025-06-11",
        end: "2025-06-25",
        progress: 30,
        assignee: "System Integrator",
        priority: "Trung bình",
      },
    ],
  },
];

// Utility functions (cập nhật để xóa logic zoom)
const getDaysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};

const getProgressWidth = (task, projectStart) => {
  const startDate = new Date(projectStart);
  const taskStart = new Date(task.start);
  const taskEnd = new Date(task.end);
  const offsetDays = Math.ceil((taskStart - startDate) / (1000 * 60 * 60 * 24));
  const durationDays = getDaysBetween(task.start, task.end);
  return { offset: offsetDays, width: durationDays };
};

const getOverallProgress = (tasks) => {
  if (!tasks.length) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
};

const getStatusColor = (progress) => {
  if (progress === 100) return "bg-green-600";
  if (progress >= 75) return "bg-blue-600";
  if (progress >= 50) return "bg-yellow-500";
  if (progress >= 25) return "bg-orange-500";
  return "bg-red-500";
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Cao":
      return "bg-red-100 text-red-800";
    case "Trung bình":
      return "bg-yellow-100 text-yellow-800";
    case "Thấp":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Hàm tạo danh sách ngày cho header (xóa logic zoom)
const getDateHeaders = (startDate, endDate) => {
  const days = getDaysBetween(startDate, endDate);
  const headers = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    headers.push({
      date: currentDate,
      label: currentDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      span: 1,
    });
  }

  return headers;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200`}
          aria-label="Trang trước"
        >
          Trước
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-blue-100 text-blue-700 hover:bg-blue-200`}
          aria-label="Trang sau"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

// Task Item Component (xóa zoomLevel)
const TaskItem = ({ task, projectStart, selectedTask, setSelectedTask }) => {
  const { offset, width } = getProgressWidth(task, projectStart);
  const isSelected = selectedTask?.id === task.id;

  return (
    <div
      className={`flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
        isSelected ? "bg-blue-50 border-blue-300" : ""
      }`}
      onClick={() => setSelectedTask(isSelected ? null : task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setSelectedTask(isSelected ? null : task);
        }
      }}
      aria-label={`Nhiệm vụ: ${task.name}`}
    >
      <div className="w-full sm:w-72 flex-shrink-0 p-4 border-r border-gray-200">
        <div className="font-medium text-gray-900 text-sm mb-1">
          {task.name}
        </div>
        <div className="text-xs text-gray-600 mb-2">{task.assignee}</div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(task.start)} - {formatDate(task.end)}
          </span>
        </div>
      </div>
      <div
        className="flex-1 items-center hidden sm:grid"
        style={{
          gridTemplateColumns: `repeat(${getDaysBetween(
            projectStart,
            task.end
          )}, minmax(30px, 1fr))`,
        }}
      >
        <div
          className="relative col-start-1 px-1"
          style={{ gridColumn: `${offset + 1} / span ${width}` }}
        >
          <div className="h-8 bg-gray-200 rounded-lg shadow-sm relative overflow-hidden group">
            <div
              className={`h-full rounded-lg transition-all duration-300 ${getStatusColor(
                task.progress
              )}`}
              style={{ width: `${task.progress}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {task.progress}%
              </span>
            </div>
            <div className="absolute top-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-md p-3 z-10 hidden group-hover:block">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">
                  {task.name}
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>Người thực hiện: {task.assignee}</div>
                  <div>Ưu tiên: {task.priority}</div>
                  <div>
                    Thời gian: {getDaysBetween(task.start, task.end)} ngày
                  </div>
                  <div>Tiến độ: {task.progress}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component (xóa zoomLevel)
const ProjectProgress = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [ganttPage, setGanttPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(3);

  // Calculate pagination
  const ganttTotalPages = Math.ceil(
    selectedProject.tasks.length / tasksPerPage
  );
  const ganttTasks = selectedProject.tasks.slice(
    (ganttPage - 1) * tasksPerPage,
    ganttPage * tasksPerPage
  );
  const summaryTotalPages = Math.ceil(
    selectedProject.tasks.length / tasksPerPage
  );
  const summaryTasks = selectedProject.tasks.slice(
    (summaryPage - 1) * tasksPerPage,
    summaryPage * tasksPerPage
  );

  // Get date headers for Gantt Chart
  const dateHeaders = getDateHeaders(
    selectedProject.startDate,
    selectedProject.endDate
  );

  return (
    <div className="min-h-screen p-4">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Tiến Độ Dự Án
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Theo dõi và quản lý tiến độ các dự án một cách hiệu quả
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedProject.id}
                onChange={(e) => {
                  setSelectedProject(
                    projects.find((p) => p.id === parseInt(e.target.value))
                  );
                  setGanttPage(1);
                  setSummaryPage(1);
                  setSelectedTask(null);
                }}
                aria-label="Chọn dự án"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông Tin Dự Án
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    {selectedProject.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedProject.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                      {selectedProject.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quản lý:</span>
                    <span className="font-medium text-gray-900">
                      {selectedProject.manager}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đội nhóm:</span>
                    <span className="font-medium text-gray-900">
                      {selectedProject.team}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bắt đầu:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedProject.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kết thúc:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedProject.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="font-medium text-blue-600">
                      {getDaysRemaining(selectedProject.endDate)} ngày
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tiến độ tổng:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {getOverallProgress(selectedProject.tasks)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getStatusColor(
                        getOverallProgress(selectedProject.tasks)
                      )} transition-all duration-300`}
                      style={{
                        width: `${getOverallProgress(selectedProject.tasks)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Tiến Độ {selectedProject.name}
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                    <span className="text-xs text-gray-600">
                      Tiến độ hoàn thành
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                    <span className="text-xs text-gray-600">
                      Thời gian nhiệm vụ
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div
                  style={{
                    minWidth: `${dateHeaders.length * 50}px`,
                  }}
                >
                  {/* Date Header */}
                  <div className="flex border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="w-full sm:w-72 flex-shrink-0 p-4 font-semibold text-gray-700 border-r border-gray-200">
                      <div>Nhiệm vụ</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Người thực hiện
                      </div>
                    </div>
                    <div
                      className="flex-1 hidden sm:flex"
                      style={{
                        gridTemplateColumns: `repeat(${dateHeaders.reduce(
                          (sum, header) => sum + header.span,
                          0
                        )}, minmax(30px, 1fr))`,
                      }}
                    >
                      {dateHeaders.map((header, index) => (
                        <div
                          key={index}
                          className={`text-center text-xs p-2 border-r border-gray-100 relative ${
                            header.isWeekend ? "bg-gray-100" : ""
                          }`}
                          style={{ gridColumn: `span ${header.span}` }}
                          title={header.date.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        >
                          <div className="font-medium text-gray-700">
                            {header.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tasks */}
                  {ganttTasks.length ? (
                    ganttTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projectStart={selectedProject.startDate}
                        selectedTask={selectedTask}
                        setSelectedTask={setSelectedTask}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Không có nhiệm vụ nào để hiển thị
                    </div>
                  )}
                </div>
              </div>

              {/* Gantt Chart Pagination */}
              {ganttTotalPages > 1 && (
                <Pagination
                  currentPage={ganttPage}
                  totalPages={ganttTotalPages}
                  onPageChange={(page) => setGanttPage(page)}
                  tasksPerPage={tasksPerPage}
                  onTasksPerPageChange={(value) => {
                    setTasksPerPage(value);
                    setGanttPage(1);
                    setSummaryPage(1);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Task Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Tóm Tắt Nhiệm Vụ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryTasks.length ? (
              summaryTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTask?.id === task.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setSelectedTask(selectedTask?.id === task.id ? null : task)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedTask(
                        selectedTask?.id === task.id ? null : task
                      );
                    }
                  }}
                  aria-label={`Nhiệm vụ: ${task.name}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      {task.name}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {task.assignee}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        task.progress === 100
                          ? "text-green-600"
                          : task.progress >= 75
                          ? "text-blue-600"
                          : task.progress >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {task.progress}%
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-2">
                    {formatDate(task.start)} - {formatDate(task.end)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(
                        task.progress
                      )} transition-all duration-300`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6 text-gray-500">
                Không có nhiệm vụ nào để hiển thị
              </div>
            )}
          </div>

          {/* Task Summary Pagination */}
          {summaryTotalPages > 1 && (
            <Pagination
              currentPage={summaryPage}
              totalPages={summaryTotalPages}
              onPageChange={(page) => setSummaryPage(page)}
              tasksPerPage={tasksPerPage}
              onTasksPerPageChange={(value) => {
                setTasksPerPage(value);
                setGanttPage(1);
                setSummaryPage(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;

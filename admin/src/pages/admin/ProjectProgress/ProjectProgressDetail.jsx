import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

// Utility functions
const getDaysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};

const getProgressWidth = (task, projectStart) => {
  const startDate = new Date(projectStart);
  const taskStart = new Date(task.start);
  const offsetDays = Math.max(0, Math.ceil((taskStart - startDate) / (1000 * 60 * 60 * 24)));
  const durationDays = Math.max(1, getDaysBetween(task.start, task.end));
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
    case 1:
      return "bg-red-100 text-red-800";
    case 2:
      return "bg-yellow-100 text-yellow-800";
    case 3:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa xác định";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isOverdue = (deadline) => {
  if (!deadline) return false;
  const currentDate = new Date("2025-06-16T00:00:00.000Z"); // Current date: June 16, 2025
  const deadlineDate = new Date(deadline);
  return deadlineDate < currentDate;
};

const getDateHeaders = (tasks, projectDeadline) => {
  if (!tasks.length || !projectDeadline) return [];
  
  // Find the earliest start date and latest end date
  const startDates = tasks
    .map(task => new Date(task.start))
    .filter(date => !isNaN(date.getTime()));
  const endDates = tasks
    .map(task => new Date(task.end))
    .filter(date => !isNaN(date.getTime()));
  const projectEnd = new Date(projectDeadline);
  
  const earliestStart = startDates.length ? new Date(Math.min(...startDates)) : projectEnd;
  const latestEnd = endDates.length ? new Date(Math.max(...endDates, projectEnd)) : projectEnd;
  
  const days = getDaysBetween(earliestStart, latestEnd);
  const headers = [];
  const start = new Date(earliestStart);

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

const TaskItem = ({ task, projectStart, selectedTask, setSelectedTask }) => {
  const { offset, width } = getProgressWidth(task, projectStart);
  const isSelected = selectedTask?._id === task._id;

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
            {task.priority === 1
              ? "Cao"
              : task.priority === 2
              ? "Trung bình"
              : "Thấp"}
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
                  <div>
                    Ưu tiên:{" "}
                    {task.priority === 1
                      ? "Cao"
                      : task.priority === 2
                      ? "Trung bình"
                      : "Thấp"}
                  </div>
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

const ProjectProgressDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [ganttPage, setGanttPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);
  const [tasksPerPage] = useState(3);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/company/viewProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const projectData = response.data.project;

        const formattedProject = {
          _id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          startDate: projectData.tasks.length
            ? projectData.tasks.reduce((earliest, task) => {
                const taskStart = new Date(task.assignedAt || task.deadline);
                return !earliest || taskStart < new Date(earliest)
                  ? taskStart.toISOString()
                  : earliest;
              }, null) || projectData.deadline
            : projectData.deadline,
          endDate: projectData.deadline,
          manager: projectData.assignedTeam?.leader?.name || "Chưa chỉ định",
          team: projectData.assignedTeam?.name || "Chưa chỉ định",
          tasks: projectData.tasks.map((task) => ({
            _id: task._id,
            name: task.name,
            description: task.description,
            status: task.status,
            progress: task.progress,
            priority: task.priority,
            assignee: task.assignedMember?.name || "Chưa chỉ định",
            start: task.assignedAt || task.deadline,
            end: task.deadline,
          })),
        };

        setSelectedProject(formattedProject);
        setGanttPage(1);
        setSummaryPage(1);
        setSelectedTask(null);
        setError(null);
        window.scrollTo(0, 0);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải thông tin dự án");
        setSelectedProject(null);
      }
    };

    fetchProject();
  }, [id]);

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  if (!selectedProject) {
    return <div className="text-center py-6 text-gray-500">Đang tải...</div>;
  }

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

  const dateHeaders = getDateHeaders(selectedProject.tasks, selectedProject.endDate);

  return (
    <div className="min-h-screen p-4">
      <div className="w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:underline text-base md:text-xl"
          >
            <ArrowLeft className="w-6 h-6 mr-1" />
            Quay lại
          </button>
        </div>
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
            <button
              onClick={() => navigate(`/project-report/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-md font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Xem Báo Cáo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                    <span className="text-gray-600">Thời hạn:</span>
                    <span
                      className={`font-medium ${
                        isOverdue(selectedProject.endDate)
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatDate(selectedProject.endDate)}
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

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Tiến độ: {selectedProject.name}
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
                  <div className="flex border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="w-full sm:w-72 flex-shrink-0 p-4 font-semibold text-gray-700 border-r border-gray-200">
                      <div>Nhiệm vụ</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Người thực hiện
                      </div>
                    </div>
                    <div
                      className="flex-1 hidden sm:grid"
                      style={{
                        gridTemplateColumns: `repeat(${dateHeaders.length}, minmax(50px, 1fr))`,
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

                  {ganttTasks.length ? (
                    ganttTasks.map((task) => (
                      <TaskItem
                        key={task._id}
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

              {ganttTotalPages > 1 && (
                <Pagination
                  currentPage={ganttPage}
                  totalPages={ganttTotalPages}
                  onPageChange={(page) => setGanttPage(page)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Tóm Tắt Nhiệm Vụ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryTasks.length ? (
              summaryTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTask?._id === task._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setSelectedTask(
                      selectedTask?._id === task._id ? null : task
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedTask(
                        selectedTask?._id === task._id ? null : task
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
                      {task.priority === 1
                        ? "Cao"
                        : task.priority === 2
                        ? "Trung bình"
                        : "Thấp"}
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
                    Thời gian: {formatDate(task.start)} - {formatDate(task.end)}
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

          {summaryTotalPages > 1 && (
            <Pagination
              currentPage={summaryPage}
              totalPages={summaryTotalPages}
              onPageChange={(page) => setSummaryPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressDetail;
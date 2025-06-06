// src/components/ProjectProgress.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../../../data/projects";

const ProjectProgress = () => {
  const navigate = useNavigate();

  const handleViewDetails = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Danh Sách Dự Án
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {project.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {project.description}
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Trạng thái:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {project.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Quản lý:</span>
                  <span>{project.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Đội nhóm:</span>
                  <span>{project.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bắt đầu:</span>
                  <span>
                    {new Date(project.startDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Kết thúc:</span>
                  <span>
                    {new Date(project.endDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(project.id)}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                aria-label={`Xem chi tiết ${project.name}`}
              >
                Xem Chi Tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
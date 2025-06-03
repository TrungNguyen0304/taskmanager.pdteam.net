import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ReportProjects = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `https://apitaskmanager.pdteam.net/api/leader/viewReport`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data && response.data._id === id) {
          setReport(response.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy báo cáo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <div>Đang tải dữ liệu báo cáo...</div>;
  }

  if (!report) {
    return <div>Không tìm thấy báo cáo cho dự án này.</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Báo Cáo Dự Án</h2>
      <div className="space-y-4">
        <p>
          <strong>ID:</strong> {report._id}
        </p>
        <p>
          <strong>Nội dung:</strong> {report.content}
        </p>
        <p>
          <strong>Khó khăn:</strong> {report.difficulties}
        </p>
        <p>
          <strong>Tiến độ:</strong> {report.taskProgress}%
        </p>
        <p>
          <strong>Nhiệm vụ:</strong> {report.task.name}
        </p>
        <p>
          <strong>Deadline:</strong>{" "}
          {new Date(report.task.deadline).toLocaleDateString("vi-VN")}
        </p>
        <p>
          <strong>Thành viên:</strong>{" "}
          {report.assignedMembers.map((member) => member.name).join(", ")}
        </p>
        <p>
          <strong>Người lãnh đạo:</strong> {report.assignedLeader}
        </p>
        <p>
          <strong>Ngày tạo:</strong>{" "}
          {new Date(report.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
};

export default ReportProjects;

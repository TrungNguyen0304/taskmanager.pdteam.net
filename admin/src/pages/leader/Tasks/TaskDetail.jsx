import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import axios from "axios";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const res = await axios.get(
          `https://apitaskmanager.pdteam.net/api/leader/viewTask/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTask(res.data.task);
      } catch (err) {
        setError("Không thể tải thông tin nhiệm vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const getPriorityText = (priority) => {
    switch (priority) {
      case 0:
        return "Thấp";
      case 1:
        return "Trung bình";
      case 2:
        return "Cao";
      default:
        return "Không rõ";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Đang tải dữ liệu...</div>;
  }

  if (error || !task) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Không tìm thấy nhiệm vụ."}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Chi tiết nhiệm vụ</h1>
      </div>

      {/* Content Box */}
      <div className="bg-slate-50 border border-gray-200 rounded-2xl shadow p-6 space-y-6">
        <DetailRow label="Tên nhiệm vụ" value={task.name} />
        <DetailRow label="Mô tả" value={task.description || "Không có mô tả"} />
        <DetailRow
          label="Trạng thái"
          value={task.status === "pending" ? "⏳ Đang chờ xử lý" : task.status}
        />
        <DetailRow label="Tiến độ" value={`${task.progress || 0}%`}>
          <div className="w-full bg-gray-200 h-2 rounded mt-1">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
        </DetailRow>
        <DetailRow label="Ưu tiên" value={getPriorityText(task.priority)} />
        <DetailRow
          label="Đã hoàn thành"
          value={task.isCompleted ? "✅ Có" : "❌ Chưa"}
        />
        <DetailRow
          label="Thông báo quá hạn"
          value={task.isOverdueNotified ? "✅ Có" : "❌ Chưa"}
        />
        <DetailRow label="ID dự án" value={task.projectId} />
        <DetailRow label="Ngày tạo" value={formatDate(task.createdAt)} />
        <DetailRow label="Ngày cập nhật" value={formatDate(task.updatedAt)} />

        {/* Button Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={() => navigate(`/update-task/${task._id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, children }) => (
  <div className="grid grid-cols-12 gap-4 items-start">
    <div className="col-span-4 text-gray-500 font-medium">{label}</div>
    <div className="col-span-8 text-gray-900">
      <p className="font-semibold">{value}</p>
      {children}
    </div>
  </div>
);

export default TaskDetail;

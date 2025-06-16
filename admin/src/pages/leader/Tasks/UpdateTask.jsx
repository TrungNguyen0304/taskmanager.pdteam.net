import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const UpdateTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "pending",
    priority: 1,
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch task data on mount
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`http://localhost:8001/api/leader/viewTask/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const task = res.data.task;
        console.log("Task data from server:", task);

        // Đảm bảo trạng thái hợp lệ
        const validStatuses = ["pending", "in_progress", "paused", "completed", "cancelled", "revoke"];
        const status = validStatuses.includes(task.status) ? task.status : "pending";

        setFormData({
          name: task.name || "",
          description: task.description || "",
          status: status,
          priority: task.priority || 1,
          deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu nhiệm vụ:", error);
        alert("Không thể tải dữ liệu nhiệm vụ.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên nhiệm vụ là bắt buộc";
    if (!["pending", "in_progress", "paused", "completed", "cancelled", "revoke"].includes(formData.status)) {
      newErrors.status = "Trạng thái không hợp lệ";
    }
    if (!formData.priority || isNaN(formData.priority) || ![1, 2, 3].includes(Number(formData.priority))) {
      newErrors.priority = "Độ ưu tiên phải là 1, 2 hoặc 3";
    }
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = "Ngày hết hạn không hợp lệ";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Form data before submit:", formData);

    try {
      await axios.put(
        `http://localhost:8001/api/leader/updateTask/${id}`,
        {
          ...formData,
          priority: Number(formData.priority), // Ensure priority is a number
          deadline: formData.deadline || undefined, // Send undefined if empty
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhiệm vụ:", error);
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      setServerError(errorMessage);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 font-medium">
        Đang tải thông tin nhiệm vụ...
      </p>
    );

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        <h2 className="text-xl md:text-3xl font-bold mb-8 text-gray-900">
          Cập Nhật Nhiệm Vụ
        </h2>
      </div>

      {serverError && (
        <p className="text-red-600 font-semibold mb-4 text-center">{serverError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tên nhiệm vụ */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Tên nhiệm vụ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên nhiệm vụ"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Mô tả chi tiết nhiệm vụ"
          />
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.status ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="pending">Chưa bắt đầu</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="paused">Tạm dừng</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="revoke">Thu hồi</option>
          </select>
          {errors.status && (
            <p className="text-red-600 text-sm mt-1">{errors.status}</p>
          )}
        </div>

        {/* Độ ưu tiên */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Độ ưu tiên <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.priority ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value={1}>Thấp (1)</option>
            <option value={2}>Trung bình (2)</option>
            <option value={3}> (3)</option>
          </select>
          {errors.priority && (
            <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Ngày hết hạn</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className={`w-full px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.deadline ? "border-red-blue-500" : "border-gray-300"}
            }`}
            placeholder="Chọn ngày hết hạn"
          />
            {errors.deadline && (
            <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>
            )}
        </div>

        {/* Nút submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition"
          >
            Cập nhật
          </button>
        </div>

        {/* Thông báo thành công */}
        {submitSuccess && (
          <p className="text-green-600 font-semibold mt-4 text-center">
            Cập nhật nhiệm vụ thành công! Đang quay lại...
          </p>
        )}
      </form>
    </div>
  );
};

export default UpdateTask;
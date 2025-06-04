import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "pending",
    projectId: "",
    priority: 2,
    progress: 0,
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          "https://apitaskmanager.pdteam.net/api/leader/showallProject",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (
          Array.isArray(response.data.projects) &&
          response.data.projects.length > 0
        ) {
          const defaultProject = response.data.projects[0];
          setProject(defaultProject);
          setFormData((prev) => ({
            ...prev,
            projectId: defaultProject._id,
          }));
        }
      } catch (error) {
        setSubmitError("Không thể tải dự án mặc định.");
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setSubmitError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên nhiệm vụ là bắt buộc";
    if (!formData.projectId) newErrors.projectId = "Dự án là bắt buộc";
    if (!formData.deadline) newErrors.deadline = "Thời hạn là bắt buộc";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        "https://apitaskmanager.pdteam.net/api/leader/createTask",
        {
          ...formData,
          priority: parseInt(formData.priority),
          progress: parseInt(formData.progress),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSubmitSuccess(true);
      setSubmitError("");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      setSubmitSuccess(false);
      setSubmitError(
        error.response?.data?.message ||
          "Lỗi khi tạo nhiệm vụ, vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full mx-auto p-6 bg-white rounded-xl shadow-md font-sans">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-700 font-medium">
              Đang tạo nhiệm vụ...
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-lg">Quay lại</span>
        </button>
        <h1 className="flex-grow text-center font-bold text-2xl text-[#222D45]">
          Tạo Nhiệm Vụ Mới
        </h1>
        <div className="w-16"></div>
      </div>

      {submitSuccess && (
        <div className="mb-6 rounded bg-green-50 border border-green-300 text-green-700 p-4 text-sm font-medium">
          Nhiệm vụ được tạo thành công!
        </div>
      )}
      {submitError && (
        <div className="mb-6 rounded bg-red-50 border border-red-300 text-red-700 p-4 text-sm font-medium">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block mb-2 font-semibold text-[#222D45] text-lg"
          >
            Tên nhiệm vụ <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên nhiệm vụ"
            required
            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="projectId"
              className="block mb-2 font-semibold text-[#222D45] text-lg"
            >
              Dự án
            </label>
            <div className="flex items-center">
              <input
                id="projectId"
                type="text"
                disabled
                value={
                  loadingProject
                    ? "Loading project..."
                    : project?.name || "No project available"
                }
                className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-[#7A869A] border-gray-200"
              />
              {loadingProject && (
                <Loader2 className="w-5 h-5 ml-3 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block mb-2 font-semibold text-[#222D45] text-lg"
            >
              Mức độ ưu tiên
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>Cao</option>
              <option value={2}>Trung bình</option>
              <option value={1}>Thấp</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="deadline"
            className="block mb-2 font-semibold text-[#222D45] text-lg"
          >
            Thời hạn <span className="text-red-500">*</span>
          </label>
          <input
            id="deadline"
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
              errors.deadline
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.deadline && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.deadline}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-2 font-semibold text-[#222D45] text-sm"
          >
            Mô tả nhiệm vụ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả nhiệm vụ"
            required
            rows="5"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-[#495057] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#6B7280] font-semibold transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold transition"
            disabled={isSubmitting}
          >
            Tạo nhiệm vụ
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
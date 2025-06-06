import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import axios from "axios";
import { useFormik } from "formik";

const CreateReport = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // thanh toán scroll về đầu trang khi vào trang này
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const formik = useFormik({
    initialValues: {
      content: "",
      taskProgress: "",
      difficulties: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.content) {
        errors.content = "Nội dung báo cáo là bắt buộc.";
      }

      if (!values.taskProgress) {
        errors.taskProgress = "Tiến độ công việc là bắt buộc.";
      } else {
        const progress = parseInt(values.taskProgress, 10);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          errors.taskProgress = "Tiến độ công việc phải nằm trong khoảng 0-100.";
        }
      }

      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      // Prepare form data for multipart/form-data request
      const formData = new FormData();
      formData.append("content", values.content);
      formData.append("taskProgress", values.taskProgress);
      if (values.difficulties) formData.append("difficulties", values.difficulties);
      if (file) formData.append("file", file);

      try {
        const response = await axios.post(
          `http://localhost:8001/api/member/createReport/${taskId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setSuccessMessage(response.data.message || "Gửi báo cáo thành công.");
        resetForm();
        setFile(null); 
        setTimeout(() => {
          navigate("/tasks"); 
        }, 2000);
      } catch (error) {
        console.error("Lỗi khi gửi báo cáo:", error);
        const errorMsg =
          error.response?.data?.message ||
          "Gửi báo cáo thất bại, vui lòng thử lại.";
        setErrorMessage(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="p-0 md:p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
                Tạo Báo Cáo
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Điền thông tin để gửi báo cáo cho công việc
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 text-green-600 p-4 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* API Error Message */}
        {errorMessage && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 relative">
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-base font-medium">
                  Đang gửi báo cáo...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Content */}
            <div>
              <label className="block text-md md:text-lg font-medium text-gray-700 mb-2">
                Nội dung báo cáo <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4"
                placeholder="Nhập nội dung báo cáo..."
                disabled={isSubmitting}
              />
              {formik.touched.content && formik.errors.content && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.content}
                </div>
              )}
            </div>

            {/* Task Progress */}
            <div>
              <label className="block text-md md:text-lg font-medium text-gray-700 mb-2">
                Tiến độ công việc (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="taskProgress"
                value={formik.values.taskProgress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập tiến độ (0-100)"
                min="0"
                max="100"
                disabled={isSubmitting}
              />
              {formik.touched.taskProgress && formik.errors.taskProgress && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.taskProgress}
                </div>
              )}
            </div>

            {/* Difficulties */}
            <div>
              <label className="block text-md md:text-lg font-medium text-gray-700 mb-2">
                Khó khăn (nếu có)
              </label>
              <textarea
                name="difficulties"
                value={formik.values.difficulties}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Mô tả khó khăn gặp phải..."
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-md md:text-lg font-medium text-gray-700 mb-2">
                Tệp đính kèm (nếu có)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Tệp đã chọn: {file.name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm sm:text-base transition-all"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm sm:text-base transition-all"
                disabled={isSubmitting}
              >
                Gửi báo cáo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;
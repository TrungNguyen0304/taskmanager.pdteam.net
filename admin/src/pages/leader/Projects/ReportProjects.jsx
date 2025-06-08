import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ReportProjects = () => {
  const { id: projectId } = useParams(); // Get projectId from URL
  const [formData, setFormData] = useState({
    content: "",
    projectProgress: "",
    difficulties: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Create FormData object for multipart/form-data
    const data = new FormData();
    data.append("content", formData.content);
    data.append("projectProgress", formData.projectProgress);
    data.append("difficulties", formData.difficulties);
    if (file) {
      data.append("file", file);
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve JWT token
      const response = await axios.post(
        `http://localhost:8001/api/leader/createReportCompany/${projectId}`, // Corrected endpoint
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(response.data.message);
      // Reset form
      setFormData({ content: "", projectProgress: "", difficulties: "" });
      setFile(null);
      document.getElementById("fileInput").value = null; // Reset file input
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi gửi báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white border rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 py-4 text-center text-blue-700">
        Gửi Báo Cáo Dự Án
      </h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 mb-4 rounded-lg flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 mb-4 rounded-lg flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="content"
            className="block text-md md:text-lg font-medium text-gray-700 mb-1"
          >
            Nội dung báo cáo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            rows="5"
            placeholder="Nhập nội dung báo cáo..."
          />
        </div>
        <div>
          <label
            htmlFor="projectProgress"
            className="block text-md md:text-lg font-medium text-gray-700 mb-1"
          >
            Tiến độ dự án (%) <span className="text-red-500">*</span>
          </label>
          <input
            id="projectProgress"
            name="projectProgress"
            type="text"
            value={formData.projectProgress}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Nhập tiến độ (0-100 hoặc 0%-100%)"
          />
        </div>
        <div>
          <label
            htmlFor="difficulties"
            className="block text-md md:text-lg font-medium text-gray-700 mb-1"
          >
            Khó khăn gặp phải
          </label>
          <textarea
            id="difficulties"
            name="difficulties"
            value={formData.difficulties}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            rows="5"
            placeholder="Mô tả khó khăn (nếu có)..."
          />
        </div>
        <div>
          <label
            htmlFor="fileInput"
            className="block text-md md:text-lg font-medium text-gray-700 mb-1"
          >
            Tệp đính kèm
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                />
              </svg>
              Đang gửi...
            </div>
          ) : (
            "Gửi báo cáo"
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportProjects;

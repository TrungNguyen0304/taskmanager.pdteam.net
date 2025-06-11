import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import axios from "axios";

const WriteReview = () => {
  const { id } = useParams(); // Get project ID from URL
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.post(
        `http://localhost:8001/api/company/submitReview/${id}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate(`/project/${id}`); // Redirect back to project report page after submission
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Viết Đánh Giá Dự Án
          </h1>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="content"
                className="block text-gray-600 font-medium mb-2"
              >
                Nội dung đánh giá
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows="6"
                placeholder="Nhập nội dung đánh giá của bạn..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;

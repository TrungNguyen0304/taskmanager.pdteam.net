// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Eye } from "lucide-react";
// import axios from "axios";

// const PAGE_SIZE = 3;

// const FeedbackMember = () => {
//   const navigate = useNavigate();
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchFeedbacks = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:8001/api/member/showAllFeedback",
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         if (Array.isArray(response.data.feedbacks)) {
//           const formatted = response.data.feedbacks.map((feedback, index) => ({
//             id: feedback._id || `feedback-${index}`,
//             content: feedback.content || "N/A",
//             rating: feedback.rating || 0,
//             createdBy: feedback.createdBy || "N/A",
//             createdAt: feedback.createdAt
//               ? new Date(feedback.createdAt).toLocaleDateString("vi-VN")
//               : "N/A",
//             taskId: feedback.taskId || "N/A",
//           }));
//           setFeedbacks(formatted);
//         } else {
//           setFeedbacks([]);
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải danh sách đánh giá:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeedbacks();
//   }, []);

//   const totalPages = Math.ceil(feedbacks.length / PAGE_SIZE);
//   const paginatedFeedbacks = feedbacks.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const handleView = (id) => {
//     navigate(`/feedback-detail/${id}`);
//   };

//   return (
//     <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center text-blue-600 hover:underline"
//         >
//           <ArrowLeft className="w-5 h-5 mr-2" />
//           Quay lại
//         </button>
//         <h2 className="text-2xl font-bold">Đánh Giá Từ Leader</h2>
//       </div>

//       {loading ? (
//         <p className="text-gray-500">Đang tải dữ liệu...</p>
//       ) : paginatedFeedbacks.length === 0 ? (
//         <p className="text-gray-500">Không có đánh giá nào.</p>
//       ) : (
//         <div className="space-y-4">
//           {paginatedFeedbacks.map((feedback, index) => (
//             <div
//               key={feedback.id}
//               className="border rounded-lg p-4 hover:shadow transition"
//             >
//               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
//                 <div className="mb-2 sm:mb-0">
//                   <div className="text-sm text-gray-500">
//                     #{(currentPage - 1) * PAGE_SIZE + index + 1}
//                   </div>
//                   <p className="text-gray-600">
//                     <strong>Nội dung:</strong> {feedback.content}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Điểm đánh giá:</strong> {feedback.rating}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Người đánh giá:</strong> {feedback.createdBy}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Ngày đánh giá:</strong> {feedback.createdAt}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Mã nhiệm vụ:</strong> {feedback.taskId}
//                   </p>
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   <button
//                     onClick={() => handleView(feedback.id)}
//                     className="flex items-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-base"
//                   >
//                     <Eye className="w-5 h-5 mr-2" />
//                     Xem chi tiết
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex justify-end mt-6 space-x-2 flex-wrap">
//           {Array.from({ length: totalPages }).map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => handlePageChange(idx + 1)}
//               className={`px-3 py-1 mb-2 border rounded ${
//                 currentPage === idx + 1
//                   ? "bg-blue-600 text-white"
//                   : "bg-white text-gray-800 hover:bg-gray-100"
//               }`}
//             >
//               {idx + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedbackMember;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Star } from "lucide-react";

const PAGE_SIZE = 3;

const FeedbackMember = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockFeedbacks = [
      {
        _id: "1",
        content: "Hoàn thành nhiệm vụ đúng thời hạn, chất lượng tốt.",
        rating: 5,
        createdBy: "Nguyễn Văn A",
        createdAt: "2025-05-01T10:00:00Z",
        taskId: "TASK-001",
      },
      {
        _id: "2",
        content: "Cần cải thiện kỹ năng giao tiếp trong nhóm.",
        rating: 3,
        createdBy: "Trần Thị B",
        createdAt: "2025-05-10T08:30:00Z",
        taskId: "TASK-002",
      },
      {
        _id: "3",
        content: "Rất nhiệt tình hỗ trợ các thành viên khác.",
        rating: 4,
        createdBy: "Lê Văn C",
        createdAt: "2025-05-15T14:20:00Z",
        taskId: "TASK-003",
      },
      {
        _id: "4",
        content: "Chưa hoàn thành nhiệm vụ được giao.",
        rating: 2,
        createdBy: "Phạm Thị D",
        createdAt: "2025-05-18T09:45:00Z",
        taskId: "TASK-004",
      },
      {
        _id: "5",
        content: "Làm việc có trách nhiệm, chủ động trong công việc.",
        rating: 5,
        createdBy: "Hoàng Văn E",
        createdAt: "2025-05-20T16:00:00Z",
        taskId: "TASK-005",
      },
    ];

    const formatted = mockFeedbacks.map((feedback, index) => ({
      id: feedback._id || `feedback-${index}`,
      content: feedback.content,
      rating: feedback.rating,
      createdBy: feedback.createdBy,
      createdAt: new Date(feedback.createdAt).toLocaleDateString("vi-VN"),
      taskId: feedback.taskId,
    }));

    setFeedbacks(formatted);
    setLoading(false);
  }, []);

  const totalPages = Math.ceil(feedbacks.length / PAGE_SIZE);
  const paginatedFeedbacks = feedbacks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/feedback-detail/${id}`);
  };

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">Đánh Giá Từ Leader</h2>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : paginatedFeedbacks.length === 0 ? (
        <p className="text-gray-500">Không có đánh giá nào.</p>
      ) : (
        <div className="space-y-5">
          {paginatedFeedbacks.map((feedback, index) => (
            <div
              key={feedback.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    #{(currentPage - 1) * PAGE_SIZE + index + 1}
                  </div>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Nội dung:</span> {feedback.content}
                  </p>
                  <p className="text-gray-700 mb-1 flex items-center gap-1">
                    <span className="font-semibold">Điểm đánh giá:</span>{" "}
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill={i < feedback.rating ? "#facc15" : "none"}
                      />
                    ))}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Người đánh giá:</span> {feedback.createdBy}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Ngày đánh giá:</span> {feedback.createdAt}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Mã nhiệm vụ:</span> {feedback.taskId}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleView(feedback.id)}
                    className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end mt-8 gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`w-10 h-10 border font-semibold transition ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackMember;


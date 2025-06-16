// import React, { useState, useEffect } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
// } from "recharts";
// import {
//   CheckCircle,
//   AlertCircle,
//   Users,
//   Briefcase,
//   FileText,
// } from "lucide-react";
// import axios from "axios";

// const Home = () => {
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Bảng màu cho biểu đồ
//   const COLORS = ["#36A2EB", "#FF6384", "#4BC0C0", "#FF9F40", "#9966FF"];

//   // Lấy thống kê từ API
//   const fetchStatistics = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         "http://localhost:8001/api/company/getCompanyStatistics",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       setStatistics(response.data);
//     } catch (err) {
//       setError("Không thể tải dữ liệu thống kê công ty");
//       console.error("Lỗi khi lấy thống kê:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStatistics();
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-100 rounded mb-6"></div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>
//             ))}
//           </div>
//           <div className="h-72 bg-gray-100 rounded-xl"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <div className="text-center text-red-500">
//           <AlertCircle className="mx-auto mb-3" size={40} />
//           <p className="text-lg font-medium">{error}</p>
//           <button
//             onClick={fetchStatistics}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Chuẩn bị dữ liệu biểu đồ cho phân bố trạng thái dự án
//   const projectStatusData =
//     statistics?.charts?.projectStatusDistribution?.data?.labels?.map(
//       (label, index) => ({
//         name:
//           label === "pending"
//             ? "Chờ xử lý"
//             : label === "in_progress"
//             ? "Đang thực hiện"
//             : label === "completed"
//             ? "Hoàn thành"
//             : label === "cancelled"
//             ? "Đã hủy"
//             : label === "revoke"
//             ? "Thu hồi"
//             : label === "paused"
//             ? "Tạm ngưng"
//             : label,
//         value:
//           statistics?.charts?.projectStatusDistribution?.data?.datasets[0]
//             ?.data[index] || 0,
//         color: COLORS[index % COLORS.length],
//       })
//     ) || [];

//   // Trình hiển thị nhãn tùy chỉnh cho biểu đồ tròn để tránh chồng lấn và xử lý giá trị bằng 0
//   const renderCustomLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     value,
//     name,
//   }) => {
//     if (value === 0) return null; // Bỏ qua việc hiển thị nhãn cho giá trị bằng 0
//     const RADIAN = Math.PI / 180;
//     const radius = outerRadius + 20; // Đặt nhãn ra xa hơn
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     const textAnchor = x > cx ? "start" : "end"; // Căn chỉnh văn bản dựa trên vị trí
//     const truncatedName = name.length > 10 ? `${name.slice(0, 10)}...` : name; // Cắt ngắn nhãn dài

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="#1F2937"
//         textAnchor={textAnchor}
//         dominantBaseline="central"
//         fontSize={12}
//       >
//         {`${truncatedName}: ${value}`}
//       </text>
//     );
//   };

//   return (
//     <div className="space-y-6 p-2 sm:p-4 w-full mx-auto">
//       {/* Tiêu đề */}
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//           Bảng Điều Khiển Công Ty
//         </h2>
//         <p className="text-gray-600 text-sm sm:text-base">
//           Tổng quan về hiệu suất và thống kê của công ty
//         </p>
//       </div>

//       {/* Thẻ thống kê nhanh */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Tổng Số Nhân Viên</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.statistics?.users?.total || 0}
//               </p>
//             </div>
//             <Users className="text-blue-500" size={28} />
//           </div>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Tổng Số Nhóm</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.statistics?.teams?.total || 0}
//               </p>
//             </div>
//             <CheckCircle className="text-green-500" size={28} />
//           </div>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Tổng Số Dự Án</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.statistics?.projects?.total || 0}
//               </p>
//             </div>
//             <Briefcase className="text-orange-500" size={28} />
//           </div>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500 mb-1">Tổng Số Báo Cáo</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {statistics?.statistics?.reports?.total || 0}
//               </p>
//             </div>
//             <FileText className="text-purple-500" size={28} />
//           </div>
//         </div>
//       </div>

//       {/* Biểu đồ tròn trạng thái dự án */}
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//           Phân Bố Trạng Thái Dự Án
//         </h3>
//         <ResponsiveContainer width="100%" height={280}>
//           <PieChart>
//             <Pie
//               data={projectStatusData}
//               cx="50%"
//               cy="50%"
//               outerRadius={90}
//               dataKey="value"
//               label={renderCustomLabel}
//               labelLine={true}
//             >
//               {projectStatusData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={entry.color} />
//               ))}
//             </Pie>
//             <Tooltip formatter={(value, name) => [value, name]} />
//             <Legend formatter={(value) => value} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Bảng tóm tắt nhanh */}
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//           Báo Cáo Nhanh
//         </h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div className="border border-gray-200 rounded-lg p-6">
//             <h4 className="text-base font-medium text-gray-900 mb-3">
//               Thống Kê Nhân Viên
//             </h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng nhân viên:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.users?.total || 0}
//                 </span>
//               </div>
//               {statistics?.statistics?.users?.roles?.map((role, index) => (
//                 <div key={index} className="flex justify-between">
//                   <span className="text-gray-600">
//                     {role.role === "company"
//                       ? "Quản trị viên"
//                       : role.role === "leader"
//                       ? "Quản lý"
//                       : role.role === "member"
//                       ? "Nhân viên"
//                       : role.role}
//                   </span>
//                   <span className="font-medium">{role.count}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-4">
//             <h4 className="text-base font-medium text-gray-900 mb-3">
//               Thống Kê Nhóm
//             </h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng nhóm:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.teams?.total || 0}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Nhóm có trưởng nhóm:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.teams?.teamsWithLeader || 0}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng thành viên:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.teams?.totalMembers || 0}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-4">
//             <h4 className="text-base font-medium text-gray-900 mb-3">
//               Thống Kê Hiệu Suất
//             </h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng nhiệm vụ:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.tasks?.total || 0}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Báo cáo có phản hồi:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.reports?.withFeedback || 0}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Điểm phản hồi trung bình:</span>
//                 <span className="font-medium">
//                   {statistics?.statistics?.reports?.averageFeedbackScore || 0}/5
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from "recharts";
// import {
//   FolderCheck,
//   FolderPlus,
//   Folder,
//   MessageSquareText,
// } from "lucide-react";

// const stats = [
//   {
//     title: "Dự Án Đã Nhận",
//     value: 35,
//     icon: <FolderPlus className="w-6 h-6 text-blue-600" />,
//   },
//   {
//     title: "Dự Án Hoàn Thành",
//     value: 20,
//     icon: <FolderCheck className="w-6 h-6 text-green-600" />,
//   },
//   {
//     title: "Dự Án Đang Tiến Hành",
//     value: 10,
//     icon: <Folder className="w-6 h-6 text-yellow-500" />,
//   },
//   {
//     title: "Dự Án Đã Thu Hồi",
//     value: 15,
//     icon: <MessageSquareText className="w-6 h-6 text-purple-600" />,
//   },
// ];

// const progressChart = [
//   {
//     name: "Tháng 1",
//     DuAnDaNhan: 70,
//     DuAnDaHoanThanh: 50,
//     DuAnDangLam: 10,
//     DuAnDaThuHoi: 10,
//   },
//   {
//     name: "Tháng 2",
//     DuAnDaNhan: 65,
//     DuAnDaHoanThanh: 60,
//     DuAnDangLam: 5,
//     DuAnDaThuHoi: 0,
//   },
//   {
//     name: "Tháng 3",
//     DuAnDaNhan: 70,
//     DuAnDaHoanThanh: 55,
//     DuAnDangLam: 10,
//     DuAnDaThuHoi: 5,
//   },
//   {
//     name: "Tháng 4",
//     DuAnDaNhan: 40,
//     DuAnDaHoanThanh: 20,
//     DuAnDangLam: 15,
//     DuAnDaThuHoi: 5,
//   },
//   {
//     name: "Tháng 5",
//     DuAnDaNhan: 80,
//     DuAnDaHoanThanh: 80,
//     DuAnDangLam: 10,
//     DuAnDaThuHoi: 5,
//   },
//   {
//     name: "Tháng 6",
//     DuAnDaNhan: 85,
//     DuAnDaHoanThanh: 72,
//     DuAnDangLam: 10,
//     DuAnDaThuHoi: 3,
//   },
//   {
//     name: "Tháng 7",
//     DuAnDaNhan: 76,
//     DuAnDaHoanThanh: 67,
//     DuAnDangLam: 7,
//     DuAnDaThuHoi: 2,
//   },
//   {
//     name: "Tháng 8",
//     DuAnDaNhan: 92,
//     DuAnDaHoanThanh: 85,
//     DuAnDangLam: 5,
//     DuAnDaThuHoi: 2,
//   },
//   {
//     name: "Tháng 9",
//     DuAnDaNhan: 60,
//     DuAnDaHoanThanh: 47,
//     DuAnDangLam: 10,
//     DuAnDaThuHoi: 3,
//   },
//   {
//     name: "Tháng 10",
//     DuAnDaNhan: 10,
//     DuAnDaHoanThanh: 7,
//     DuAnDangLam: 2,
//     DuAnDaThuHoi: 1,
//   },
//   {
//     name: "Tháng 11",
//     DuAnDaNhan: 97,
//     DuAnDaHoanThanh: 85,
//     DuAnDangLam: 12,
//     DuAnDaThuHoi: 0,
//   },
//   {
//     name: "Tháng 12",
//     DuAnDaNhan: 89,
//     DuAnDaHoanThanh: 88,
//     DuAnDangLam: 1,
//     DuAnDaThuHoi: 0,
//   },
// ];

// const recentProjects = [
//   {
//     name: "Website Bán Hàng",
//     team: "Frontend",
//     progress: "100%",
//     status: "Hoàn thành",
//   },
//   {
//     name: "App Chấm Công",
//     team: "Backend",
//     progress: "80%",
//     status: "Đang làm",
//   },
//   {
//     name: "CRM Nội Bộ",
//     team: "Fullstack",
//     progress: "65%",
//     status: "Đang làm",
//   },
//   { name: "Dự Án 4", team: "Mobile", progress: "50%", status: "Đang làm" },
//   { name: "Dự Án 5", team: "DevOps", progress: "30%", status: "Đang làm" },
//   { name: "Dự Án 6", team: "Frontend", progress: "90%", status: "Hoàn thành" },
// ];

// const feedbacks = [
//   {
//     user: "Nguyễn Văn A",
//     message: "Thiết kế mới rất dễ sử dụng!",
//     date: "20/05/2025",
//   },
//   {
//     user: "Trần Thị B",
//     message: "Tôi cần thêm tính năng lọc dự án.",
//     date: "19/05/2025",
//   },
//   {
//     user: "Lê Thị C",
//     message: "Giao diện trực quan, dễ thao tác.",
//     date: "18/05/2025",
//   },
//   {
//     user: "Phạm Văn D",
//     message: "Mong có thêm báo cáo tiến độ chi tiết.",
//     date: "17/05/2025",
//   },
//   {
//     user: "Trần Văn E",
//     message: "Tốc độ load trang nhanh, rất tốt.",
//     date: "16/05/2025",
//   },
// ];

// const ITEMS_PER_PAGE = 3;

// const Home = () => {
//   const [projectPage, setProjectPage] = useState(1);
//   const [feedbackPage, setFeedbackPage] = useState(1);

//   const projectTotalPages = Math.ceil(recentProjects.length / ITEMS_PER_PAGE);
//   const feedbackTotalPages = Math.ceil(feedbacks.length / ITEMS_PER_PAGE);

//   const displayedProjects = recentProjects.slice(
//     (projectPage - 1) * ITEMS_PER_PAGE,
//     projectPage * ITEMS_PER_PAGE
//   );

//   const displayedFeedbacks = feedbacks.slice(
//     (feedbackPage - 1) * ITEMS_PER_PAGE,
//     feedbackPage * ITEMS_PER_PAGE
//   );

//   const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//     const pages = [];
//     for (let i = 1; i <= totalPages; i++) {
//       pages.push(i);
//     }
//     return (
//       <div className="mt-4 flex flex-wrap gap-2 justify-end">
//         {pages.map((page) => (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm ${
//               page === currentPage
//                 ? "bg-blue-600 text-white shadow-md"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//             }`}
//             aria-label={`Trang ${page}`}
//           >
//             {page}
//           </button>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="p-3 sm:p-4 md:p-6 w-full mx-auto font-sans text-gray-900 min-w-0">
//       <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 tracking-wide">
//         Trang Chủ
//       </h2>

//       {/* Thẻ thông số */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
//         {stats.map((item, index) => (
//           <div
//             key={index}
//             className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex items-center space-x-4 sm:space-x-5 hover:shadow-lg transition-shadow duration-300"
//           >
//             <div className="p-3 sm:p-4 bg-gray-100 rounded-full flex items-center justify-center">
//               {item.icon}
//             </div>
//             <div>
//               <div className="text-xl sm:text-2xl font-semibold text-gray-800">
//                 {item.value}
//               </div>
//               <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
//                 {item.title}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Biểu đồ tiến độ với 4 chỉ số % */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8 sm:mb-12">
//         <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
//           Tỷ lệ dự án theo trạng thái (%)
//         </h3>
//         <ResponsiveContainer width="100%" height={380} className="sm:h-[320px]">
//           <LineChart
//             data={progressChart}
//             margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
//             <XAxis
//               dataKey="name"
//               tick={{ fill: "#6b7280", fontSize: "12px" }}
//               tickLine={false}
//               axisLine={{ stroke: "#d1d5db" }}
//             />
//             <YAxis
//               domain={[0, 100]}
//               tickFormatter={(tick) => `${tick}%`}
//               tick={{ fill: "#6b7280", fontSize: "12px" }}
//               tickLine={false}
//               axisLine={{ stroke: "#d1d5db" }}
//               label={{
//                 value: "Phần Trăm",
//                 angle: -90,
//                 position: "insideLeft",
//                 fill: "#6b7280",
//                 offset: 10,
//                 style: {
//                   textAnchor: "middle",
//                   fontSize: 12,
//                   fontWeight: "600",
//                 },
//               }}
//             />
//             <Tooltip
//               formatter={(value) => `${value}%`}
//               contentStyle={{ borderRadius: 8, borderColor: "#9ca3af" }}
//               itemStyle={{ color: "#374151", fontSize: "12px" }}
//             />
//             <Legend verticalAlign="top" height={36} />
//             <Line
//               type="monotone"
//               dataKey="DuAnDaNhan"
//               stroke="#3b82f6"
//               strokeWidth={3}
//               dot={{ r: 5 }}
//               activeDot={{ r: 7 }}
//               name="Dự Án Đã Nhận"
//             />
//             <Line
//               type="monotone"
//               dataKey="DuAnDaHoanThanh"
//               stroke="#10b981"
//               strokeWidth={3}
//               dot={{ r: 5 }}
//               activeDot={{ r: 7 }}
//               name="Dự Án Đã Hoàn Thành"
//             />
//             <Line
//               type="monotone"
//               dataKey="DuAnDangLam"
//               stroke="#f59e0b"
//               strokeWidth={2}
//               dot={{ r: 4 }}
//               name="Dự Án Đang Làm"
//             />
//             <Line
//               type="monotone"
//               dataKey="DuAnDaThuHoi"
//               stroke="#ef4444"
//               strokeWidth={2}
//               dot={{ r: 4 }}
//               name="Dự Án Đã Thu Hồi"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Dự án gần đây */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8 sm:mb-12">
//         <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
//           Dự Án Gần Đây
//         </h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto border-collapse border border-gray-300 text-left text-xs sm:text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3 font-medium text-gray-700">
//                   Tên dự án
//                 </th>
//                 <th className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3 font-medium text-gray-700">
//                   Đội nhóm
//                 </th>
//                 <th className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3 font-medium text-gray-700">
//                   Tiến độ
//                 </th>
//                 <th className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3 font-medium text-gray-700">
//                   Trạng thái
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedProjects.map((project, idx) => (
//                 <tr
//                   key={idx}
//                   className="even:bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
//                 >
//                   <td className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3">
//                     {project.name}
//                   </td>
//                   <td className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3">
//                     {project.team}
//                   </td>
//                   <td className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3">
//                     {project.progress}
//                   </td>
//                   <td className="border border-gray-300 px-3 sm:px-5 py-2 sm:py-3">
//                     {project.status}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <Pagination
//           currentPage={projectPage}
//           totalPages={projectTotalPages}
//           onPageChange={setProjectPage}
//         />
//       </div>

//       {/* Phản hồi */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
//         <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
//           Phản Hồi Từ Người Dùng
//         </h3>
//         <ul className="space-y-4 sm:space-y-5 max-h-80 sm:max-h-96 overflow-y-auto">
//           {displayedFeedbacks.map((fb, idx) => (
//             <li
//               key={idx}
//               className="border-l-4 border-blue-600 bg-gray-50 p-3 sm:p-4 rounded-md shadow-sm"
//             >
//               <p className="font-semibold text-gray-900 text-sm sm:text-base">
//                 {fb.user}
//               </p>
//               <p className="text-gray-700 mt-1 text-xs sm:text-sm">
//                 {fb.message}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">{fb.date}</p>
//             </li>
//           ))}
//         </ul>
//         <Pagination
//           currentPage={feedbackPage}
//           totalPages={feedbackTotalPages}
//           onPageChange={setFeedbackPage}
//         />
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  FileText,
  Clock,
  List,
  Star,
} from "lucide-react";
import axios from "axios";

const Home = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bảng màu cho biểu đồ
  const COLORS = ["#36A2EB", "#FF6384", "#4BC0C0", "#FF9F40", "#9966FF"];

  // Lấy thống kê từ API
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8001/api/company/getCompanyStatistics",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStatistics(response.data);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê công ty");
      console.error("Lỗi khi lấy thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-100 rounded mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-72 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="text-center text-red-500">
          <AlertCircle className="mx-auto mb-3" size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu biểu đồ cho phân bố trạng thái dự án
  const projectStatusData =
    statistics?.charts?.projectStatusDistribution?.data?.labels?.map(
      (label, index) => ({
        name:
          label === "pending"
            ? "Chờ xử lý"
            : label === "in_progress"
              ? "Đang thực hiện"
              : label === "completed"
                ? "Hoàn thành"
                : label === "cancelled"
                  ? "Đã hủy"
                  : label === "revoke"
                    ? "Thu hồi"
                    : label === "paused"
                      ? "Tạm ngưng"
                      : label,
        value:
          statistics?.charts?.projectStatusDistribution?.data?.datasets[0]?.data[
          index
          ] || 0,
        color: COLORS[index % COLORS.length],
      })
    ) || [];

  // Chuẩn bị dữ liệu biểu đồ cho phân bố trạng thái nhiệm vụ
  const taskStatusData =
    statistics?.charts?.taskStatusDistribution?.data?.labels?.map(
      (label, index) => ({
        name:
          label === "pending"
            ? "Chờ xử lý"
            : label === "in_progress"
              ? "Đang thực hiện"
              : label === "completed"
                ? "Hoàn thành"
                : label === "cancelled"
                  ? "Đã hủy"
                  : label,
        value:
          statistics?.charts?.taskStatusDistribution?.data?.datasets[0]?.data[
          index
          ] || 0,
      })
    ) || [];

  // Chuẩn bị dữ liệu biểu đồ cho điểm phản hồi trung bình
  const feedbackScoreData =
    statistics?.charts?.feedbackScoreDistribution?.data?.labels?.map(
      (label, index) => ({
        name: label,
        value:
          statistics?.charts?.feedbackScoreDistribution?.data?.datasets[0]?.data[
          index
          ] || 0,
      })
    ) || [];

  // Trình hiển thị nhãn tùy chỉnh cho biểu đồ tròn
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? "start" : "end";
    const truncatedName = name.length > 10 ? `${name.slice(0, 10)}...` : name;

    return (
      <text
        x={x}
        y={y}
        fill="#1F2937"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${truncatedName}: ${value}`}
      </text>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 w-full mx-auto">
      {/* Tiêu đề */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bảng Điều Khiển Công Ty
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Tổng quan về hiệu suất và thống kê của công ty
        </p>
      </div>

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Nhân Viên</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.statistics?.users?.total || 0}
              </p>
            </div>
            <Users className="text-blue-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Nhóm</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.statistics?.teams?.total || 0}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Dự Án</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.statistics?.projects?.total || 0}
              </p>
            </div>
            <Briefcase className="text-orange-500" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Số Báo Cáo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.statistics?.reports?.total || 0}
              </p>
            </div>
            <FileText className="text-purple-500" size={28} />
          </div>
        </div>
      </div>

      {/* Biểu đồ trạng thái dự án và nhiệm vụ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Biểu đồ tròn trạng thái dự án */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Phân Bố Trạng Thái Dự Án
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={true}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột trạng thái nhiệm vụ */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Phân Bố Trạng Thái Nhiệm Vụ
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#36A2EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ điểm phản hồi trung bình */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Điểm Phản Hồi Trung Bình Theo Loại
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={feedbackScoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="value" fill="#4BC0C0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng tóm tắt chi tiết */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Báo Cáo Chi Tiết
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Thống kê nhân viên */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Users className="mr-2" size={20} />
              Thống Kê Nhân Viên
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng nhân viên:</span>
                <span className="font-medium">
                  {statistics?.statistics?.users?.total || 0}
                </span>
              </div>
              {statistics?.statistics?.users?.roles?.map((role, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {role.role === "company"
                      ? "Quản trị viên"
                      : role.role === "leader"
                        ? "Quản lý"
                        : role.role === "member"
                          ? "Nhân viên"
                          : role.role}
                  </span>
                  <span className="font-medium">{role.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thống kê nhóm */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircle className="mr-2" size={20} />
              Thống Kê Nhóm
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng nhóm:</span>
                <span className="font-medium">
                  {statistics?.statistics?.teams?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhóm có trưởng nhóm:</span>
                <span className="font-medium">
                  {statistics?.statistics?.teams?.teamsWithLeader || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhóm có dự án:</span>
                <span className="font-medium">
                  {statistics?.statistics?.teams?.teamsWithProjects || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng thành viên:</span>
                <span className="font-medium">
                  {statistics?.statistics?.teams?.totalMembers || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Thống kê dự án */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Briefcase className="mr-2" size={20} />
              Thống Kê Dự Án
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng dự án:</span>
                <span className="font-medium">
                  {statistics?.statistics?.projects?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dự án được giao:</span>
                <span className="font-medium">
                  {statistics?.statistics?.projects?.assigned || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dự án hoàn thành:</span>
                <span className="font-medium">
                  {statistics?.statistics?.projects?.completedProjects || 0}
                </span>
              </div>s
              <div className="flex justify-between">
                <span className="text-gray-600">Tiến độ trung bình (%):</span>
                <span className="font-medium">
                  {statistics?.statistics?.projects?.averageProjectProgress || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dự án quá hạn:</span>
                <span className="font-medium text-red-500">
                  {statistics?.statistics?.projects?.overdueProjects || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Thống kê nhiệm vụ */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <List className="mr-2" size={20} />
              Thống Kê Nhiệm Vụ
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng nhiệm vụ:</span>
                <span className="font-medium">
                  {statistics?.statistics?.tasks?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhiệm vụ quá hạn:</span>
                <span className="font-medium text-red-500">
                  {statistics?.statistics?.tasks?.totalOverdueTasks || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thành viên có nhiệm vụ:</span>
                <span className="font-medium">
                  {statistics?.statistics?.tasks?.membersWithTasks || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thành viên có nhiệm vụ quá hạn:</span>
                <span className="font-medium text-red-500">
                  {statistics?.statistics?.tasks?.membersWithOverdueTasks || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhiệm vụ đang thực hiện:</span>
                <span className="font-medium">
                  {statistics?.statistics?.tasks?.totalInProgressTasks || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Thống kê báo cáo */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="mr-2" size={20} />
              Thống Kê Báo Cáo
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng báo cáo:</span>
                <span className="font-medium">
                  {statistics?.statistics?.reports?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Báo cáo có phản hồi:</span>
                <span className="font-medium">
                  {statistics?.statistics?.reports?.reportsWithFeedback || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm phản hồi trung bình:</span>
                <span className="font-medium">
                  {statistics?.statistics?.reports?.averageFeedbackScore || 0}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Báo cáo trung bình/dự án:</span>
                <span className="font-medium">
                  {statistics?.statistics?.reports?.averageReportsPerProject || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Thống kê phản hồi */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Star className="mr-2" size={20} />
              Thống Kê Phản Hồi
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng phản hồi:</span>
                <span className="font-medium">
                  {statistics?.statistics?.feedbacks?.total || 0}
                </span>
              </div>
              {statistics?.statistics?.feedbacks?.types?.map((type, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại: {type.type}</span>
                    <span className="font-medium">{type.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm trung bình:</span>
                    <span className="font-medium">{type.averageScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm thấp nhất:</span>
                    <span className="font-medium">{type.minScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm cao nhất:</span>
                    <span className="font-medium">{type.maxScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách dự án quá hạn */}
        {statistics?.statistics?.projects?.overdueProjects > 0 && (
          <div className="mt-6">
            <h4 className="text-base font-medium text-red-600 mb-3 flex items-center">
              <Clock className="mr-2" size={20} />
              Dự Án Quá Hạn ({statistics?.statistics?.projects?.overdueProjects})
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {statistics?.statistics?.projects?.overdueProjectNames?.map(
                (name, index) => (
                  <li key={index}>{name}</li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

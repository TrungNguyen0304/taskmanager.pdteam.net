const express = require("express");
const {
  // user
  createUser,
  updateUser,
  deleteUser,
  showAllLeaders,
  showAllMember,
  paginationLeader,
  paginationMember,
  viewMember,
  viewLeader,
  // team
  createTeam,
  updateTeam,
  showallTeam,
  deleteTeam,
  paginationTeam,
  viewTeam,
  //project
  createProject,
  updateProject,
  showallProject,
  deleteProject,
  assignProject,
  viewTeamProject,
  getUnassignedProject,
  paginationUnassignedProject,
  getAssignedProjects,
  paginationAssignedProjects,
  revokeProjectAssignment,
  showAllReportLeader,
  viewReportTeam,
  evaluateLeaderReport,
} = require("../controller/company.js");
const authenticateJWT = require("../middleware/auth.js");
const authorize = require("../middleware/authorize.js");

const router = express.Router();

// thêm sửa xóa , show sắp xếp, phân trang leader và member
// Tạo người dùng User
router.post("/createUser", authenticateJWT, authorize("company"), createUser);

// Cập nhật người dùng theo ID
router.put(
  "/updateUser/:id",
  authenticateJWT,
  authorize("company"),
  updateUser
);

// Xóa người dùng theo ID
router.delete(
  "/deleteUser/:id",
  authenticateJWT,
  authorize("company"),
  deleteUser
);

// Xem tất cả Leaders
router.get(
  "/showallLeaders",
  authenticateJWT,
  authorize("company"),
  showAllLeaders
);

// Xem tất cả Members
router.get(
  "/showallMember",
  authenticateJWT,
  authorize("company"),
  showAllMember
);

// Xem chi tiết thông tin của một thành viên theo ID
router.get(
  "/viewMember/:id",
  authenticateJWT,
  authorize("company"),
  viewMember
);

// Xem chi tiết thông tin của một leader theo ID
router.get(
  "/viewLeader/:id",
  authenticateJWT,
  authorize("company"),
  viewLeader
);

// Phân trang Leaders
router.post(
  "/paginationLeader",
  authenticateJWT,
  authorize("company"),
  paginationLeader
);

// Phân trang Members
router.post(
  "/paginationMember",
  authenticateJWT,
  authorize("company"),
  paginationMember
);

// thêm sửa xóa leader và member vào taem
// Tạo nhóm
router.post("/createTeam", authenticateJWT, authorize("company"), createTeam);

// Cập nhật nhóm theo ID
router.put(
  "/updateTeam/:id",
  authenticateJWT,
  authorize("company"),
  updateTeam
);

// Xem tất cả nhóm
router.get("/showallTeam", authenticateJWT, authorize("company"), showallTeam);

// Xóa nhóm theo ID
router.delete(
  "/deleteTeam/:id",
  authenticateJWT,
  authorize("company"),
  deleteTeam
);

// Phân trang nhóm
router.post(
  "/paginationTeam",
  authenticateJWT,
  authorize("company"),
  paginationTeam
);

// Xem chi tiết thông tin của một nhóm theo ID
router.get("/viewTeam/:id", authenticateJWT, authorize("company"), viewTeam);

// thêm sửa xóa , show sắp xếp, phân trang project và gán project vào team
// Tạo dự án
router.post(
  "/createProject",
  authenticateJWT,
  authorize("company"),
  createProject
);

// Cập nhật dự án theo ID
router.put(
  "/updateProject/:id",
  authenticateJWT,
  authorize("company"),
  updateProject
);

// Xem tất cả dự án
router.get(
  "/showallProject",
  authenticateJWT,
  authorize("company"),
  showallProject
);

// Xóa dự án theo ID
router.delete(
  "/deleteProject/:id",
  authenticateJWT,
  authorize("company"),
  deleteProject
);

// Phân trang dự án
router.post(
  "/paginationProject",
  authenticateJWT,
  authorize("company"),
  paginationTeam
);

//assignProject
router.put(
  "/assignProject/:id",
  authenticateJWT,
  authorize("company"),
  assignProject
);

// Xem chi tiết thông tin của một dự án theo ID
router.get(
  "/viewTeamProject/:id",
  authenticateJWT,
  authorize("company"),
  viewTeamProject
);

// Lấy ra toàn bộ task chưa giao
router.get(
  "/unassigned",
  authenticateJWT,
  authorize("company"),
  getUnassignedProject
);

// Phân trang task chưa giao
router.post(
  "/paginationunassigned",
  authenticateJWT,
  authorize("company"),
  paginationUnassignedProject
);

// Lấy ra toàn bộ dự án đã được giao
router.get(
  "/getassigned",
  authenticateJWT,
  authorize("company"),
  getAssignedProjects
);

// Phân trang dự án đã được giao
router.post(
  "/paginationgetassigned",
  authenticateJWT,
  authorize("company"),
  paginationAssignedProjects
);

// Thu hồi lại dự án
router.put(
  "/revokeProject/:id/revoke",
  authenticateJWT,
  authorize("company"),
  revokeProjectAssignment
);

// Xem tất cả report của leader
router.get(
  "/showAllReportLeader",
  authenticateJWT,
  authorize("company"),
  showAllReportLeader
);

// Xem đánh giá của nhóm theo ID
router.get(
  "/viewReportTeam/:id",
  authenticateJWT,
  authorize("company"),
  viewReportTeam
);

// Đánh giá Leader theo ID
router.post(
  "/evaluateLeaderReport/:id",
  authenticateJWT,
  authorize("company"),
  evaluateLeaderReport
);

module.exports = router;

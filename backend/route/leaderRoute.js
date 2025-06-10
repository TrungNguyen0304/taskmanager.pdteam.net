const express = require("express");
const {
  getMyTeam,
  viewAssignedProject,
  createTask,
  updateTask,
  showAllTasks,
  deleteTask,
  paginationTask,
  assignTask,
  revokeTaskAssignment,
  unassignedTask,
  getAssignedTask,
  showallReport,
  showAllReportMember,
  evaluateMemberReport,
  createReportCompany,
  showAllFeedback,
  viewTask,
  showAllReportTask,
  viewTeam,
  viewProject,
  getStatistics,
  showallMember,
} = require("../controller/leader.js");
const authenticateJWT = require("../middleware/auth.js");
const authorize = require("../middleware/authorize.js");
const upload = require("../middleware/upload.js");

const router = express.Router();
// xem task của mình được giao
router.get("/showallTeam/", authenticateJWT, getMyTeam);

router.get("/showallMember/", authenticateJWT, showallMember);

router.get("/viewTeam/:id", authenticateJWT, viewTeam);

// xem tất cả các project của mình
router.get("/showallProject/", authenticateJWT, viewAssignedProject);

// xem tất cả project của team theo id
router.get("/viewProject/:id", authenticateJWT, viewProject);

// tạo task
router.post("/createTask", authenticateJWT, authorize("leader"), createTask);

// xem tất cả task của mình theo id project
router.get(
  "/showallTask/:projectId",
  authenticateJWT,
  authorize("leader"),
  showAllTasks
);

// cập nhật task theo id
router.put("/updateTask/:id", authenticateJWT, authorize("leader"), updateTask);

// xóa task theo id
router.delete(
  "/deleteTask/:id",
  authenticateJWT,
  authorize("leader"),
  deleteTask
);

// phân trang task
router.post(
  "/paginationTask",
  authenticateJWT,
  authorize("leader"),
  paginationTask
);

// gán task vào member theo id
router.put("/assignTask/:id", authenticateJWT, authorize("leader"), assignTask);

// thu hồi task theo id
router.put(
  "/revokeTask/:id/revoke",
  authenticateJWT,
  authorize("leader"),
  revokeTaskAssignment
);

// lấy ra toàn bộ task chưa giao
router.get(
  "/unassignedTask/",
  authenticateJWT,
  authorize("leader"),
  unassignedTask
);

// lấy ra toàn bộ task đã giao
router.get(
  "/getAssignedTask/",
  authenticateJWT,
  authorize("leader"),
  getAssignedTask
);

//show ra report của member
router.get("/viewReport/", authenticateJWT, authorize("leader"), showallReport);

// lấy ra report của từng member theo id
router.get(
  "/viewReportMember/:id/",
  authenticateJWT,
  authorize("leader"),
  showAllReportMember
);

// xem tất cả báo cáo theo id
router.get(
  "/showAllReportTask/:id/",
  authenticateJWT,
  authorize("leader"),
  showAllReportTask
);

// đánh giá báo cáo của member theo id
router.post(
  "/evaluateMemberReport/:id",
  authenticateJWT,
  authorize("leader"),
  evaluateMemberReport
);

// tạo báo cáo của leader dành cho company
router.post(
  "/createReportCompany/:id",
  upload.single("file"),
  authenticateJWT,
  authorize("leader"),
  createReportCompany
);

// xem tất cả đánh giá của leader
router.get(
  "/showAllFeedback/",
  authenticateJWT,
  authorize("leader"),
  showAllFeedback
);

// view taskid
router.get(`/viewTask/:id`, authenticateJWT, authorize("leader"), viewTask);

// thong ke 
router.get("/getStatistics/", authenticateJWT, getStatistics);

module.exports = router;

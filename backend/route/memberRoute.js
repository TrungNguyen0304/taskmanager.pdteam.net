const express = require("express");
const {
  getMyTeam,
  getMyTasks,
  createReport,
  showAllFeedback,
  updateTaskStatus,
  viewTeam,
  viewTask
} = require("../controller/member.js");
const authenticateJWT = require("../middleware/auth.js");

const router = express.Router();

// xem tất cả team của mình
router.get("/showallTeam/", authenticateJWT, getMyTeam);

// xem tất cả đánh giá của mình
router.get("/showAllFeedback/", authenticateJWT, showAllFeedback);

// xem tất cả task của mình được giao
router.get("/showallTask/", authenticateJWT, getMyTasks);

// tạo báo cáo
router.post("/createReport/", authenticateJWT, createReport);

// cập nhật trạng thái task
router.put("/updateStatus/:id", authenticateJWT, updateTaskStatus);

router.get("/viewTeam/:id", authenticateJWT, viewTeam);
router.get("/viewTask/:id", authenticateJWT, viewTask);

module.exports = router;

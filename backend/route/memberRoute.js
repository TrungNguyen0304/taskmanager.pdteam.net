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
const upload = require('../middleware/upload.js');

const router = express.Router();

// xem tất cả team của mình
router.get("/showallTeam/", authenticateJWT, getMyTeam);

// xem tất cả đánh giá của mình
router.get("/showAllFeedback/", authenticateJWT, showAllFeedback);

// xem tất cả task của mình được giao
router.get("/showallTask/", authenticateJWT, getMyTasks);

// tạo báo cáo
router.post("/createReport/:id",upload.single('file') ,authenticateJWT, createReport);

// cập nhật trạng thái task
router.put("/updateStatus/:id", authenticateJWT, updateTaskStatus);

// xem chi tiết team
router.get("/viewTeam/:id", authenticateJWT, viewTeam);

// xem chi tiết task
router.get("/viewTask/:id", authenticateJWT, viewTask);

module.exports = router;

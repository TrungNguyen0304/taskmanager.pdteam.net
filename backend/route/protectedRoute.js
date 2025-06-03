
const express = require("express");
const authenticateJWT = require("../middleware/auth.js");

const router = express.Router();

router.get("/profile", authenticateJWT, (req, res) => {
  res.json({
    message: "Dữ liệu người dùng được bảo vệ",
    user: req.user,
  });
});

module.exports = router;

const express = require("express");
const { login, saveFcmToken } = require("../controller/user.js");
const authenticateJWT = require("../middleware/auth.js");
require("../config/passport.js");

const router = express.Router();

// Route đăng nhập
router.post("/login", login);

router.post('/fcm-token', authenticateJWT, saveFcmToken);

module.exports = router;
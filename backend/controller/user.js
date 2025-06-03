const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const passport = require("passport");
const User = require("../models/user")
const bcrypt = require("bcryptjs");
dotenv.config();

// Tạo JWT token
const generateToken = (user) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    phoneNumber: user.phoneNumber,
    address: user.address,
    
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });
};
const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info?.message || "Đăng nhập thất bại",
      });
    }

    const token = generateToken(user);
    res.json({ token });
  })(req, res, next);
};

const saveFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user._id;

  if (!fcmToken) {
    return res.status(400).json({ message: "Thiếu FCM token." });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: "Lưu FCM token thành công." });
  } catch (error) {
    console.error("Lỗi lưu FCM token:", error);
    res.status(500).json({ message: "Lỗi server khi lưu FCM token." });
  }
};

module.exports = { login, saveFcmToken };
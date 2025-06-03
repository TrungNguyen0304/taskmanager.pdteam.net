const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token không hợp lệ." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded._id) {
      return res.status(401).json({ message: "Token không chứa thông tin người dùng hợp lệ." });
    }

    // socket.userId = decoded._id;

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err.message);
    res.status(403).json({ message: "Token hết hạn hoặc không hợp lệ." });
  }
};

module.exports = authenticateJWT;
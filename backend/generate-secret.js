const crypto = require("crypto");

const jwtSecret = crypto.randomBytes(64).toString("hex");
console.log("🔐 JWT_SECRET của bạn là:\n", jwtSecret);
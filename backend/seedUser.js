const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/user.js"); 

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email: "admin123@gmail.com" });

    if (existingUser) {
      console.log(" User already exists");
    } else {
      const hashedPassword = await bcrypt.hash("123456", 10);
      await User.create({
        name: "Nguyễn Đình Trung",
        email: "trung123@gmail.com",
        password: hashedPassword,
        role: "company",
      });
      console.log(" User created");
    }
  } catch (error) {
    console.error(" Error creating user:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Nếu bạn muốn chạy file trực tiếp
createTestUser();

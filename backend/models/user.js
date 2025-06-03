const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ."],
    },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["company", "leader","member"],
        default: "member",
        required: true,
    },
    gender: {
        type: Number,
        enum: [0, 1], // 0: Nam, 1: Nữ (hoặc ngược lại tùy bạn định nghĩa)
        required: false,
    },
    dateOfBirth: {
        type: Date,
        required: false,
    },
    phoneNumber: {
        type: String,
        match: [/^\d{9,15}$/, "Số điện thoại không hợp lệ."],
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    fcmToken: { type: String },
})

const User = mongoose.model("User", userSchema)
module.exports = User;

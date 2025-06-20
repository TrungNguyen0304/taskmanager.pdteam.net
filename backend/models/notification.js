const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "task", "system"],
      default: "info",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["socket", "firebase", "system"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetType: {
      type: String, enum: ["task", "report", "project", "team", "feedback"],
      default: null
    },

  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
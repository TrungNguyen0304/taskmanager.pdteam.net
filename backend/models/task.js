const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  assignedMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: false
  },
  deadline: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ["draft", "pending", "in_progress", "completed", "cancelled", "revoked"],
    default: "draft"
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  priority: {
    type: Number,
    enum: [1, 2, 3],
    default: 2
  },
  isCompleted: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  isOverdueNotified: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  assignedAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});


const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
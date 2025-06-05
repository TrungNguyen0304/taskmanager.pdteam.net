const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false
  },
  assignedLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  assignedMembers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  companyManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false
  },

  deadline: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ["revoke", "in_progress", "completed", "cancelled", "pending"],
    default: "pending"
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


const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
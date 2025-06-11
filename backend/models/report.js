const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    difficulties: {
        type: String,
        required: true
    },
    taskProgress: {
        type: Number,
        required: false,
        min: 0,
        max: 100
    },
    projectProgress: {
        type: Number,
        required: false,
        min: 0,
        max: 100
    },

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: false
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    assignedMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    ],
    assignedLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    file: {
        type: String,
        default: null
    },
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

module.exports = mongoose.model('Report', reportSchema);

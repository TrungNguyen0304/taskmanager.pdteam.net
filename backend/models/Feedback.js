const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    from: {
        type: String,
        enum: ['Company', 'Leader'],
        required: true
    },
    to: {
        type: String,
        enum: ['Leader', 'Member'],
        required: true
    }
}, {
    timestamps: true // tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('Feedback', FeedbackSchema);

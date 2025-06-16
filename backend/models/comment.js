const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
    comment: String,
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    from: { type: String, enum: ['company', 'leader', 'member'] },
    to: { type: String, enum: ['company', 'leader', 'member'] },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);

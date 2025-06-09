const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    message: { type: String, required: null },
    timestamp: { type: Date, default: Date.now },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    fileName: String,
    fileSize: Number,
    fileId: String,
    imageUrl: { type: String },
    fileType: String,

})

const Message = mongoose.model("Message", messageSchema)
module.exports = Message;

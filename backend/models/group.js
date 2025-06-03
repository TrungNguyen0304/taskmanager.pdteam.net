const mongoose = require("mongoose")

const groupSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

})

const Group = mongoose.model("Group", groupSchema)
module.exports = Group;

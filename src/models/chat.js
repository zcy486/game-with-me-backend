"use strict";

const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    userA: {
        type: String,
        required: true,
    },
    userB: {
        type: String,
        required: true,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }],
});

ChatSchema.set("versionKey", false);

ChatSchema.index({userA: 1, userB: 1});
module.exports = mongoose.model("Chat", ChatSchema);
"use strict";

const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    userID: {
        type: String,
        unique: true,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    chatList: {
        type: [String],
        required: true,
    },
    connected: {
        type: Boolean,
        required: true,
    }
});

SessionSchema.set("versionKey", false);

module.exports = mongoose.model("Session", SessionSchema);
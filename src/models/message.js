"use strict";

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
});

MessageSchema.set("versionKey", false);
MessageSchema.set("timestamps", true);

module.exports = mongoose.model("Message", MessageSchema);
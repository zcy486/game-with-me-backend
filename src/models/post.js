"use strict";

const mongoose = require("mongoose");

// Define schema for posts
const PostSchema = new mongoose.Schema( {
    price: {
        type: Number,
        required: true,
    },
    postType: {
        type: String,
        enum: ["Carry", "Chill", "All Types"],
        required: true,
    },
    introduction: {
        type: String,
        required: true,
    },
    language: {
        type: [String],
        required: true,
    },
    servers: {
        type: [String],
        required: true,
    },
    platforms: {
        type: [String],
        required: true,
    },
    screenshots: {
        type: [String],
        required: true,
    },
    availableTime: {
        type: [String],
        required: true,
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
    },
    companionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Companion",
        required: true,
    }
});

PostSchema.set("timestamps", true)

module.exports = mongoose.model("Post", PostSchema);

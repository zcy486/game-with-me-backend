"use strict";

const mongoose = require("mongoose");
const Game = require("./game");

// Define schema for posts
const PostSchema = new mongoose.Schema( {
    price: {
        type: Number,
        required: true,
    },
    postType: {
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
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
    },
    companionId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

PostSchema.set("timestamps", true)

module.exports = mongoose.model("Post", PostSchema);

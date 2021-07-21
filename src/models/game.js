"use strict";

const mongoose = require("mongoose");

// Define schema for posts
const GameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    allServers: {
        type: [String],
        required: true,
    },
    allPlatforms: {
        type: [String],
        required: true,
    },
    gamePic: {
        type: String,
        required: true,
    },
    numPosts: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model("Game", GameSchema);
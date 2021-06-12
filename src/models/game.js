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
    isPopular: {
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.model("Game", GameSchema);
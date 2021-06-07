"use strict";

const mongoose = require("mongoose");
// Define schema for posts
const GameSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    allServers: {
        type: [String],
    },
    allPlatforms: {
        type: [String],
    },
});

module.exports = mongoose.model("Game", GameSchema);
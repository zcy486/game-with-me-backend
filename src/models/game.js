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
    },
    gamePic: {
        type: String,
        required: true,
    }
});

//GameSchema.index({name: "text"});
module.exports = mongoose.model("Game", GameSchema);
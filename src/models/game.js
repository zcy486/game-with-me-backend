"use strict";

const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

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

GameSchema.plugin(mongoose_fuzzy_searching, {fields: ['name']});
module.exports = mongoose.model("Game", GameSchema);
"use strict";

const mongoose = require("mongoose");
const User = require("./user");

const CompanionSchema = new mongoose.Schema({
    ratings: {
        type: Number,
        min: 0,
        max: 5,
        required: true,
        default: 0,
    },
    orderNumber: {
        type: Number,
        min: 0,
        required: true,
        default: 0,
    },
    reviewNumber: {
        type: Number,
        min: 0,
        required: true,
        default: 0,
    },
    onlineStatus: {
        type: String,
        enum: ["Online", "Offline", "Busy"],
        required: true,
        default: "Online"
    }
});

CompanionSchema.set("versionKey", false);
const Companion = User.discriminator("Companion", CompanionSchema);

module.exports = mongoose.model("Companion");



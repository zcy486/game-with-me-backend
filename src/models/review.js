"use strict";

const mongoose = require("mongoose");

// Define schema for posts
const ReviewSchema = new mongoose.Schema( {
    star: {
        type: Number,
        required: true,
    },
    label: [{
        type: String,
        enum: ["Humorous", "Carry in game", "Interactive", "Friendly", "Patient", "Rude"],
        required: false,
    }],
    reviewText: {
        type: String,
        required: false,
    },
    companionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gamerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },

});

ReviewSchema.set("timestamps", true)

module.exports = mongoose.model("Review", ReviewSchema);
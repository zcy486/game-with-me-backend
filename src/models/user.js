"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: -1,
        max: 999,
        required: true,
        default: -1,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "not given"],
        required: true,
        default: "not given",
    },
    isPremium: {
        type: Boolean,
        required: true,
        default: false,
    },
});

UserSchema.set("versionKey", false);

module.exports = mongoose.model("User", UserSchema);
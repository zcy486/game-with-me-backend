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
        min: 0,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    isPremium: {
        type: Boolean,
        required: true,
    },
});

UserSchema.set("versionKey", false);

module.exports = mongoose.model("User", UserSchema);
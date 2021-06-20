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
        max: 999,
        required: true,
        default: 0,
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

    balance: {
        type: Number,
        min:0,
        required: true,
        //TODO: to be 0 
        default: 20,
    }
});

UserSchema.set("versionKey", false);
UserSchema.index({username: "text"});
module.exports = mongoose.model("User", UserSchema);
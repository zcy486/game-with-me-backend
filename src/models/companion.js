"use strict";

const mongoose = require("mongoose");
const User = require("./user");

const CompanionSchema = new mongoose.Schema({
    ratings: {
        type: Number,
        min: 1,
        max: 5,
    },
    orderNumber: {
        type: Number,
        min: 0,
    },
    reviewNumber: {
        type: Number,
        min: 0,
    },
});

CompanionSchema.set("versionKey", false);
const Companion = User.discriminator("Companion", CompanionSchema);

module.exports = mongoose.model("Companion");



"use strict";

const mongoose = require("mongoose");

const PaymentHistorySchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
    type: {
        type: String,
        enum:["Recharge","Withdraw"],
        
    },

    totalEcoin: {
        type: Number,
        required: true,
    },

    account: {
        type: String,
        required: true
    }
});


PaymentHistorySchema.set("versionKey", false);
PaymentHistorySchema.set("timestamps", true);

module.exports = mongoose.model("Payment", PaymentHistorySchema);
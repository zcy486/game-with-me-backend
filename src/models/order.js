"use strict";

const mongoose = require("mongoose");

// Define the order schema
const OrderSchema = new mongoose.Schema(
    {
        orderPrice: {
            type: Number,
            required: true,
        },

        orderStatus:{
            type: String,
            enum: ["Created","Confirmed","CompletedByCompanion","CompletedByGamer"],
        },


        postId: {
            type: mongoose.Schema.Types.ObjectId, ref: "Post" , required: true

        },

        //TODO: to be updated
        companionId: { type: mongoose.Schema.Types.ObjectId, ref: "Companion"},


        //store the id of the gamer
        gamerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},

    
        //images to be added 
        thumbnail: String,

        //zy..date, gameId, amount of games?
   /*      gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
           
        }, //!!   */
        
    },
  
);

OrderSchema.set("versionKey", false);
OrderSchema.set("timestamps", true);

module.exports = mongoose.model("Order", OrderSchema);
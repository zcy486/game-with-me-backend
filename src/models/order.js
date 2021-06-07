"use strict";

const mongoose = require("mongoose");

// Define schema for ratings
const RatingSchema = new mongoose.Schema({
    // user who gave the rating
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // rating of user
    labels:{
        enum: ["Humorous", "Carry in game", "Bad attitude", "good", "bad"],
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    text:{
        type: String,
    }
});

// Define the movie schema
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

        //store the id of the gamer
        gamerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},

    
        //Rating to be done after the order
        orderRating: [RatingSchema],

        //store the id of the gaming conpanion
        companionId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},

        //images to be added 
        thumbnail: String,
        
      
    },
  
);
// opts are added to MovieSchema since later we want to add calculated fields to the schema
// and we want that these calculated fields are included in the json object of the entry

RatingSchema.set("versionKey", false);
OrderSchema.set("versionKey", false);
OrderSchema.set("timestamps", true);

// Export the Movie model
module.exports = mongoose.model("Order", OrderSchema);

"use strict";

const mongoose = require("mongoose");

// TODO: Define schema for ratings
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
const PostSchema = new mongoose.Schema(
    {
        //store the id of the companion 
        //TODO: change ref: "user" to companion
        companionId: { 
             type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},


        price: {
            type: Number,
            required: true,
            min:0,
            
        },

        introduction: { 
            type: String,
            required: true,
            default: "Hey i am using the GameWithMe"

        },

        gameName:{
            type: String,
            enum: ["a","b",'c','d'],
            required: true,
    
        },
    
        // serverlist
        gameServer: {
            type: [String],
            enum: ["CN", "EU", "NA", "JP", "KR", "LAN", "RU"],
            required: true,
        },
    
        //platformlist
        gamePlatform:{
            type: [String],
            enum: ["PC", "SWITCH", "MOBILE PHONE"],
            required: true,
    
        },

        //images to be added 
        thumbnail: String,

        //upload screenshots to be added 
        screenshots: [String],
        
      
    },
  
);

//TODO: REFINE
RatingSchema.set("versionKey", false);


PostSchema.set("versionKey", false);
PostSchema.set("timestamps", true);


// Export the Movie model
module.exports = mongoose.model("Post", PostSchema);
"use strict";

const gameModel = require("../models/game");

// list games
const list = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
        let allPosts = await gameModel.find({}).exec();
        let popularPosts = await gameModel.find({isPopular: true}).exec();
        const posts = {
            all: allPosts,
            popular: popularPosts,
        }
        return res.status(200).json(posts);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};


module.exports = {
    list,
};
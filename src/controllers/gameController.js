"use strict";

const gameModel = require("../models/game");

// list games
const list = async (req, res) => {
    try {
        let allGames = await gameModel.find({}).exec();
        let popularGames= await gameModel.find({isPopular: true}).exec();
        const games = {
            all: allGames,
            popular: popularGames,
        }
        return res.status(200).json(games);
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
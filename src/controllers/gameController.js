"use strict";

const gameModel = require("../models/game");

// list all games for game selector
const list = async (req, res) => {
    try {
        let allGames = await gameModel.find({}).sort({name: 1}).exec();
        let popularGames = await gameModel.find({}).sort({numPosts: -1}).limit(3).exec();
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

// get Id of the game with most posts
const getMostPopularId = async (req, res) => {
    try {
        let game = await gameModel.find({}).sort({numPosts: -1}).limit(1).exec();
        return res.status(200).json({gameId: game[0]._id.toString()});
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

// get game info by Id
const getGameInfoById = async (req, res) => {
    try {
        // get game with id from database
        let game = await gameModel.findById(req.params.id);
        // if no game with id is found, return 404
        if (!game) {
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        }
        let response = {
            name: game.name,
            allServers: game.allServers,
            allPlatforms: game.allPlatforms,
        };
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
}


module.exports = {
    list,
    getGameInfoById,
    getMostPopularId,
};
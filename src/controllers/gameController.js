"use strict";

const gameModel = require("../models/game");

// list games
const list = async (req, res) => {
    try {
        let allGames = await gameModel.find({}).sort({name: 1}).exec();
        let popularGames= await gameModel.find({isPopular: true}).sort({name: 1}).exec();
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

const getIdByName = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'The request body is empty'
        });
    }

    try {
        let game = await gameModel.findOne({name: req.body.gameName}).exec();

        if (!game) return res.status(404).json({
            error: 'Not Found',
            message: `User not found`
        });

        return res.status(200).json({gameId: game._id.toString()});
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

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
    getIdByName,
    getGameInfoById,
};
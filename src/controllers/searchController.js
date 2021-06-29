"use strict"

const Game = require("../models/game");
const Companion = require("../models/companion");

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const search = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }

    try {
        let input = req.body.userInput;
        //console.log("input: <"+input+">");

        let matched_games = await Game.find(
            {name: {$regex: escapeRegex(input), $options: 'i'}},
        ).limit(10);

        let games = matched_games.map((game) => {
            return {
                id: game._id.toString(),
                name: game.name,
                group: "Games",
            }
        });

        let matched_companions = await Companion.find(
            {$text: {$search: input}},
            {score: {$meta: "textScore"}}
        ).sort(
            {score: {$meta: "textScore"}}
        ).limit(10);

        /* alternative way to match users, powerful but inefficient
        let matched_companions = await Companion.find(
            {username: {$regex: escapeRegex(input), $options: 'i'}},
        ).limit(10);
         */

        let companions = matched_companions.map((user) => {
            return {
                id: user._id.toString(),
                name: user.username,
                group: "Companions",
            }
        });
        let results = games.concat(companions);
        //console.log("results:");
        //console.log(results);

        return res.status(200).json(results);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
}

module.exports = {
    search,
};
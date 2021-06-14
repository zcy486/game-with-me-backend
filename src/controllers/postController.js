"use strict";

const postModel = require("../models/post");
const gameModel = require("../models/game")

const create = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    // handle the request
    try {
        // create post in database
        const newPost = {
            price: req.body.price,

            postType: req.body.postType,

            introduction: req.body.introduction,

            language: req.body.language,

            servers: req.body.servers,

            platform: req.body.platform,

            screenshots: req.body.screenshots,

            availableTime: req.body.availableTime,

            gameId: req.body.gameId,

            companionId: req.body.companionId,
        }

        let post = await postModel.create(newPost);
        // return created post
        return  res.status(200).json(post);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

const read = async (req, res) => {
    try {
        // get post with id from database
        console.log(req.params.id)
        let post = await postModel.findById(req.params.id).exec();
        // if no post with id is found, return 404
        console.log(post)
        if (!post)
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        // return gotten post
        return res.status(200).json(post);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};

const updateStatus = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    // handle the request
    try {
        // find and update post with id
        let post = await postModel.findByIdAndUpdate(
            req.params.id,
            {
                price: req.body.price,
                postType: req.body.postType,
                introduction: req.body.introduction,
                language: req.body.language,
                servers: req.body.servers,
                platform: req.body.platform,
                screenshots: req.body.screenshots,
                availableTime: req.body.screenshots,
            },
            {
                new: true,
                runValidators: true,
            }
        )
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

const remove = async  (req, res) => {
    try {
        await postModel.findByIdAndRemove(req.params.id).exec();
        return res
            .status(200)
            .json({message: `Post with id${req.params.id} was deleted`});
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
}

// list all posts of a given game
const listByGame = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
        let game = await gameModel.findById(req.body.gameId).exec();
        let posts = await postModel.find({gameId: req.body.gameId}).exec();
        const response = {
            name: game.name,
            servers: game.allServers,
            platforms: game.allPlatforms,
            posts: posts,
        }
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

// list all posts of a gaming companion
const listByCompanion = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
        let posts = await postModel.find({companionId: req.body.companionId}).exec();
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
    create,
    read,
    updateStatus,
    remove,
    listByGame,
    listByCompanion,
};
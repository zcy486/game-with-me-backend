"use strict";

const postModel = require("../models/post");
const gameModel = require("../models/game");
const UserModel = require("../models/user");
const CompanionModel = require("../models/companion");
const mongoose = require('mongoose');

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
            platforms: req.body.platforms,
            screenshots: req.body.screenshots,
            availableTime: req.body.availableTime,
            gameId: req.body.gameId,
            companionId: req.body.companionId,
        }
        let post = await postModel.create(newPost);

        // change role of user to companion
        const companion_id = req.body.companionId;
        let exist = await CompanionModel.findById(companion_id);
        if(!exist) {
            await UserModel.findByIdAndUpdate(companion_id, {__t: "Companion"});
        }

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
        let post = await postModel.findById(req.params.id).exec();
        // if no post with id is found, return 404
        if (!post) {
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        }

        let companion = await UserModel.findById(post.companionId);
        let game = await gameModel.findById(post.gameId);
        let fullPost = {
            ...post.toObject(),
            gameName: game.name,
            companionName: companion.username,
            companionAge: companion.age,
            //TODO add companion fields
        }
        // return gotten post
        return res.status(200).json(fullPost);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};

//TODO not in use yet
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
                platforms: req.body.platforms,
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

//TODO list all posts of a given game with filters
const listWithFilters = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
        let filters = {};
        let sortType = {};
        Object.keys(req.body).forEach((key) => {
            if(req.body[key] !== "") {
                switch (key) {
                    case "gameId":
                        filters[key] = mongoose.Types.ObjectId(req.body[key])
                        break;
                    case "price":
                        switch (req.body[key]) {
                            case "0-5":
                                filters[key] = {$gte: 0, $lte: 5}
                                break;
                            case "6-10":
                                filters[key] = {$gte: 6, $lte: 10}
                                break;
                            case "11-20":
                                filters[key] = {$gte: 11, $lte: 20}
                                break;
                            case "20+":
                                filters[key] = {$gte: 20}
                                break;
                            default:
                        }
                        break;
                    case "postType":
                        switch (req.body[key]) {
                            case "Carry":
                                filters[key] = {$in: ["Carry", "All Types"]}
                                break;
                            case "Chill":
                                filters[key] = {$in: ["Chill", "All Types"]}
                                break;
                            default:
                                break;
                        }
                        break;
                    case "servers":
                        filters[key] = {$all: [req.body[key]]};
                        break;
                    case "platforms":
                        filters[key] = {$all: [req.body[key]]};
                        break;
                    case "sortBy":
                        //TODO: Change to orders and ratings
                        if (req.body[key] === "orders") {
                            sortType = {"price": -1}
                        } else {
                            sortType = {"price": 1}
                        }
                        break;
                    default:
                        filters[key] = req.body[key];
                        break;
                }
            }
        });

        console.log(filters);
        //TODO change type of gameId (from String to ObjectId)
        let posts = await postModel.aggregate([
            {$match: filters},
            {$lookup: {from: "User", localField: "_id", foreignField: "companionId", as: "companion"}},
            {$sort: sortType},
            {$limit: 20},
            ]
        );

        //TODO: to be optimized
        let new_posts = [];
        for (const post of posts) {
            const companion_id = post.companionId;
            let companion = await UserModel.findById(companion_id);
            new_posts.push({...post, companionName: companion.username});
        }
        const response = {
            posts: new_posts,
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
        //TODO: to be optimized + change user to companion
        let companion = await UserModel.findById(req.body.companionId);
        let posts = await postModel.find({companionId: req.body.companionId});
        let ret_posts = [];
        for (const post of posts) {
            const game_id = post.gameId;
            let game = await gameModel.findById(game_id);
            ret_posts.push({...post.toObject(), gameName: game.name});
        }

        const response = {
            username: companion.username,
            age: companion.age,
            gender: companion.gender,
            //TODO add companion fields

            posts: ret_posts
        }
        return res.status(200).json(response);
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
    listWithFilters,
    listByCompanion,
};
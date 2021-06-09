"use strict";

const PostModel = require("../models/post");

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
            companionId: req.body.companionId,
    
            price: req.body.price,
            
            introduction: req.body.introduction,
    
            gameName: req.body.gameName,

            gameServer: req.body.gameServer,
            
            gamePlatform: req.body.gamePlatform,

        }

        let post = await PostModel.create(newPost);

        // return created post
        return res.status(200).json(post);
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
        let post = await PostModel.findById(req.params.id).exec();

        // if no post with id is found, return 404
        if (!post)
            return res.status(404).json({
                error: "Not Found",
                message: `post not found`,
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

const updatePost = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }

    // handle the request
    try {
        // find and update movie with id
        let post = await PostModel.findByIdAndUpdate(
            req.params.id, 
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        // return updated movie
        return res.status(200).json(post);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};


const remove = async (req, res) => {
    try {
        // find and remove post
        await PostModel.findByIdAndRemove(req.params.id).exec();

        // return message that post was deleted
        return res
            .status(200)
            .json({ message: `post with id${req.params.id} was deleted` });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

const list = async (req, res) => {
    try {
        // get all posts in database
        let posts = await PostModel.find({}).exec();

        // return gotten posts
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
    updatePost,
    remove,
    list,
};
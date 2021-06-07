"use strict";

const postModel = require("../models/post");

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
        let post = await PostModel.findById(req.params.id).exec();
        // if no post with id is found, return 404
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

const list = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
    let posts = await postModel.find({gameId: req.params.gameId}).exec();
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
    list,
};
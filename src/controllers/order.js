"use strict";

const OrderModel = require("../models/order");
const PostModel = require("../models/post");
const GameModel = require("../models/game");
const UserModel = require("../models/user");
const CompanionModel = require("../models/companion");

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const create = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    // handle the request
    try {
        // create order in database
        const newOrder = {
            orderPrice: req.body.orderPrice,

            orderStatus: "Created",

            postId: req.body.postId,

            gamerId: req.body.gamerId,

            companionId: req.body.companionId,
                      
            
        }

        let order = await OrderModel.create(newOrder);

        // return created order
        return res.status(200).json(order);
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
        // get order with id from database
        let order = await OrderModel.findById(req.params.id).exec();
      
        // if no order with id is found, return 404
        if (!order)
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        let companion = await CompanionModel.findById(order.companionId);
        let post = await PostModel.findById(order.postId);
        let game = await GameModel.findById(post.gameId);
        let count  = order.orderPrice / post.price;
        let fullOrder = {
            ...order.toObject(),
            gameName: game.name,
            companionName: companion.username,
            orderNumber: companion.orderNumber,
            gameNumber: count,
            reviewNumber: companion.reviewNumber,
            //avatarUrl: companion.avatarUrl,
        }

        // return gotten order
        return res.status(200).json(fullOrder);
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
        // find and update movie with id
        let order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus: req.body.orderStatus },
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        // return updated order
        return res.status(200).json(order);
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
        // find and remove order
        await OrderModel.findByIdAndRemove(req.params.id).exec();

        // return message that order was deleted
        return res
            .status(200)
            .json({ message: `order with id${req.params.id} was deleted` });
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
        // get all orders in database
        let orders = await OrderModel.find({}).exec();

        // return gotten orders
        return res.status(200).json(orders);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

//read order lists by user's ID
const readByUserId = async (req, res) => {
    try {
       

        console.log(req.params.id);
        let orderResult = await OrderModel.aggregate(
            [ { $match :  {'gamerId': ObjectId(req.params.id)}},

              { $lookup : {from: PostModel.collection.name, localField: "postId", foreignField: "_id", as: "post"}},
                {$unwind: "$post"}, 
                { $lookup : {from: CompanionModel.collection.name, localField: "companionId", foreignField: "_id", as: "companion" }},
                {$unwind: "$companion"},
                { $lookup : {from: UserModel.collection.name, localField: "companionId", foreignField: "_id", as: "user" }},
                {$unwind: "$user"},
                { $lookup: {from: GameModel.collection.name, localField: "post.gameId", foreignField: "_id", as: "game"}},
                {$unwind: "$game"},
                { $project: {_id: 1, orderPrice:1, orderStatus: 1, companionId: 1, createdAt: 1, companionName: "$companion.username", gameName: "$game.name", avatar: "$user.avatarUrl" }}
            ]);            
            
            console.log(orderResult);

        // if no order with id is found, return 404
        if (!orderResult){
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        }
   
        // return gotten order
        return res.status(200).json(orderResult);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};
const getCompanionOrders = async (req, res) => {
 

    try {
        let orders = await OrderModel.find({
            companionId: req.params.id
        }).exec();

        //retrieve companion information---username, avatarUrl.
        //retrieve post information ---gameName.
        let infoOrders = [];

        for (const order of orders) {

            let gamer = await UserModel.findById(req.params.id);
            let post = await PostModel.findById(order.postId);
            const gameId = post.gameId;
            let count  = order.orderPrice / post.price;
            let game = await GameModel.findById(gameId);
            infoOrders.push({
                ...order.toObject(),
                gameName: game.name,
                gameNumber: count,
                gamerName: gamer.username,
                gamerAvatarUrl: gamer.avatarUrl,

            });
        }

        const response = {
            orders: infoOrders
        }
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
}


module.exports = {
    create,
    read,
    updateStatus,
    remove,
    list,
    readByUserId,
    getCompanionOrders,
};
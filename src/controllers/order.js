"use strict";

const OrderModel = require("../models/order");

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

        // return gotten order
        return res.status(200).json(order);
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
            {orderStatus: req.body.orderStatus},
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        // return updated movie
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
        // get order with id from database
        let order = await OrderModel.find({gamerId: req.params.id}).exec();

        // if no order with id is found, return 404
        if (!order){
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        }
        // return gotten order
        return res.status(200).json(order);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
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
    readByUserId,
};
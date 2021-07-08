"use strict";

const PaymentModel = require("../models/payment");

const create = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    // handle the request
    try {
        const newPayment = {
            userId: req.body.userId,

            type: req.body.type,

            totalEcoin: req.body.totalEcoin,

            account: req.body.account,

            order: req.body.order,
        }

        let payment = await PaymentModel.create(newPayment);

        // return created order
        return res.status(200).json(payment);
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
        let payments = await PaymentModel.find({}).exec();

        // return gotten orders
        return res.status(200).json(payments);
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
        let payment = await PaymentModel.findById(req.params.id).exec();

        // if no order with id is found, return 404
        if (!payment)
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });

        // return gotten order
        return res.status(200).json(payment);
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
    list,
   
};
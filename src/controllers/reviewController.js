"use strict";

const reviewModel = require("../models/review");

const create = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    // handle the request
    try {
        // create review in database
        const newReview = {
            star: req.body.star,

            label: req.body.label,

            reviewText: req.body.reviewText,

            companionId: req.body.companionId,
           
        }

        let review = await reviewModel.create(newReview);
        // return created review
        return  res.status(200).json(review);
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
        // get review with id from database
        console.log(req.params.id)
        let review = await reviewModel.findById(req.params.id).exec();
        // if no review with id is found, return 404
        if (!review) {
            return res.status(404).json({
                error: "Not Found",
                message: `order not found`,
            });
        }

        let companion = await UserModel.findById(review.companionId);
        let fullreview = {
            ...review.toObject(),
            
            companionName: companion.username,
        
            //TODO add more here...
        }
        // return gotten review
        console.log(res);
        return res.status(200).json(fullreview);
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
        // find and update review with id
        let review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                star: req.body.star,

                label: req.body.label,
    
                reviewText: req.body.reviewText,
    
                companionId: req.body.companionId,
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

//what is delete review looks like
const remove = async  (req, res) => {
    try {
        await reviewModel.findByIdAndRemove(req.params.id).exec();
        return res
            .status(200)
            .json({message: `review with id${req.params.id} was deleted`});
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
    
};
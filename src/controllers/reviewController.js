"use strict";

const reviewModel = require("../models/review");
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
        // create review in database
        const newReview = {
            star: req.body.star,

            label: req.body.label,

            reviewText: req.body.reviewText,

            orderId: req.body.orderId,

            companionId: req.body.companionId,
            
            gamerId: req.body.gamerId,
           
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

const readByOrderId = async (req, res) => {
    try {
     /*    // get review with companionId from database
        let review = await reviewModel.find({orderId: req.params.id}).exec();

        // if no review with id is found, return 404
        if (!review){
            return res.status(404).json({
                error: "Not Found",
                message: `review not found`,
            });
        }
         // return gotten order
         return res.status(200).json(review); */
  

         console.log(req.params.id);
        let review = await reviewModel.aggregate(
            [{ $match : {'orderId': ObjectId(req.params.id)}},
                { $lookup: {from: UserModel.collection.name, localField: "companionId", foreignField: "_id", as: "user" }},
               
                {$unwind: "$user"},
                { $lookup : {from: CompanionModel.collection.name, localField: "companionId", foreignField: "_id", as: "companion" }},
                {$unwind: "$companion"},
                { $project: {ratings:"$companion.ratings", companionId: 1, star:1, label: 1, reviewText: 1, gamerId: 1, orderId: 1, companionName: "$user.username", avatar: "$user.avatarUrl" }} 
            ]

        );
        if (!review){
            return res.status(404).json({
                error: "Not Found",
                message: `review not found`,
            });
        }
        // return gotten order
        return res.status(200).json(review.length===1?review[0]:{});
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};

const readByCompanionId = async (req, res) => {
    try {
        // get review with companionId from database
        //let review = await reviewModel.find({companionId: req.params.id}).exec();
        let reviews = await reviewModel.aggregate(
            [{ $match : {'companionId': ObjectId(req.params.id)}},
                { $lookup: {from: UserModel.collection.name, localField: "companionId", foreignField: "_id", as: "user" }},
               
                {$unwind: "$user"},
               /*  { $lookup : {from: CompanionModel.collection.name, localField: "companionId", foreignField: "_id", as: "companion" }},
                {$unwind: "$companion"}, */
                //{ $project: {ratings:{$avg:"$star"}, companionId: 1, star:1, label: 1, reviewText: 1, gamerId: 1, 
                //orderId: 1, companionName: "$user.username", avatar: "$user.avatarUrl" }} 
                //{$group: {_id: "$companionId", ratings:{$avg:"$star"}}},
                {$group: {_id: "$companionId", ratings:{$avg:"$star"}, avatar:{$first: "$user.avatarUrl"}, name:{$first: "$user.username"}}}
            ]

        );
        // if no review with id is found, return 404
        if (!reviews){
            return res.status(404).json({
                error: "Not Found",
                message: `review not found`,
            });
        }
  /*       let companion = await CompanionModel.findById(review.companionId);
        let fullReview = {
            ...review.toObject(),            
            companionName: companion.username,            
            ratings: companion.ratings,            
            avatarUrl: companion.avatarUrl,
        } */
        

        // return gotten review
        return res.status(200).json(reviews.length !== 0? reviews[0]: {});
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }

};

const updateReview = async (req, res) => {
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
    
                //companionId: req.body.companionId,
            },
            {
                new: true,
                runValidators: true,
            }
            
        ); return res.status(200).json(review);
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
    readByOrderId,
    readByCompanionId,
    updateReview,
    remove,
    
};
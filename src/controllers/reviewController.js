"use strict";

const reviewModel = require("../models/review");
const UserModel = require("../models/user");
const CompanionModel = require("../models/companion");

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const handleCompanionUpdate = async (companionId, star, needUpdate, oldReview) => {
    try {
        const reviewFound = await reviewModel.find({"companionId": companionId});
        const reviewNumber = reviewFound.length;

        const {ratings} = await CompanionModel.findById(
            companionId
        ).exec();
        //const newReviewNumber = (!needUpdate && reviewNumber === 0)? reviewNumber+1 : reviewNumber;
        const newRatings = (ratings*((needUpdate)? reviewNumber: reviewNumber-1) - oldReview + star) / reviewNumber;
        console.log(reviewNumber)
        console.log(ratings)
        console.log(companionId, star, needUpdate, oldReview)
        //console.log(newReviewNumber)
        let companion = await CompanionModel.findByIdAndUpdate(
            companionId,
            {
                reviewNumber: reviewNumber,
                ratings: newRatings,
            },
            {
                new: true,
                runValidators: true,
            }
        );
        console.log(companion);
        return companion? true: false;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const create = async (req, res) => {
    // check if the body of the request contains all necessary properties
    const {star, label, reviewText, orderId, companionId, gamerId} = req.body;
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    // handle the request
    try {
        // create review in database
        const newReview = {
            star: star,

            label: label,

            reviewText: reviewText,

            orderId: orderId,

            companionId: companionId,
            
            gamerId: gamerId,
           
        }

        let review = await reviewModel.create(newReview);
        if(review){
            //assume Companion
            const companion  = await handleCompanionUpdate(companionId, star, false, 0);
            if(!companion){
                res.status(500).json({
                    message: "Update Failed for Companion"
                });
            } 
            return  res.status(200).json(review);
        }else{
            res.status(400).json({
                message: "Create Failed for Review"
            });
        }
        // return created review
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
        let result = await CompanionModel.findById(req.params.id).exec();
        if (!result){
            return res.status(404).json({
                error: "Not Found",
                message: `review not found`,
            });
        }
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};

const readWithLabels = async (req, res) => {
    try {
        let reviews = await reviewModel.find({companionId: req.params.id}).populate("gamerId");

        const labelMap = new Map();
        let resultReviews = reviews.map((review) => {
           review.label.forEach((label) => {
               if(labelMap.has(label)) {
                   labelMap.set(label, labelMap.get(label) + 1);
               } else {
                   labelMap.set(label, 1);
               }
           });
           return {
               star: review.star,
               reviewText: review.reviewText,
               gamerName: review.gamerId.username,
               gamerAvatar: review.gamerId.avatarUrl,
               createdAt: review.createdAt,
           }
        });

        const arrayLabels = Array.from(labelMap.entries());
        return res.status(200).json({
            labels: arrayLabels,
            reviews: resultReviews,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
}

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
        const oldReview = await reviewModel.findById(req.params.id);
        let review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                star: req.body.star,

                label: req.body.label,
    
                reviewText: req.body.reviewText,
    
            },
            {
                new: true,
                runValidators: true,
            }
            
        ); 
        if(review){
            const companion = await handleCompanionUpdate(oldReview.companionId, req.body.star, true, oldReview.star);
            if(companion){
                return res.status(200).json(review);
            }else{
                res.status(500).json({
                    error: "Internal Server Error",
                    message: "failed to update companion",
                });
            };
        }else{
            res.status(400).json({
                error: "Internal Server Error",
                message: "failed to update review",
            });
        }

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
    readWithLabels,
};
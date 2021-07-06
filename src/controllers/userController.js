"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const UserModel = require("../models/user");
const CompanionModel = require("../models/companion");

//filesystem needed for images
const fs = require('fs');
const path = require('path');


const login = async (req, res) => {
    //check if the body of the request contains all necessary properties
    if (!Object.prototype.hasOwnProperty.call(req.body, "password")) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body must contain a password property",
        });
    }
    if (!Object.prototype.hasOwnProperty.call(req.body, "username")) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body must contain a username property",
        });
    }

    //handle the request
    try {
        //get the user from the database
        let user = await UserModel.findOne({
            username: req.body.username,
        }).exec();

        //validate password
        const isValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        if (!isValid) {
            return res.status(401).send({
                token: null
            });
        }

        //create a token
        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            isPremium: user.isPremium,
            balance: user.balance,
            avatarUrl: user.avatarUrl,

        }, config.JwtSecret, {
            expiresIn: 86400, //24hrs
        });

        return res.status(200).json({
            token: token,
        });

    } catch (err) {
        return res.status(404).json({
            error: "User Not Found",
            message: err.message,
        });
    }
};

const register = async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, "password")) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body must contain a password property",
        });
    }
    if (!Object.prototype.hasOwnProperty.call(req.body, "username")) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body must contain a username property",
        });
    }

    //handle the request
    try {
        // hash the password before storing it in the database
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        //create a new user object
        const newUser = {
            username: req.body.username,
            password: hashedPassword,
        }

        let user = await UserModel.create(newUser);

        //create a token (age and gender are optional)
        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            isPremium: user.isPremium,
            balance: user.balance,
            avatarUrl: user.avatarUrl,
        }, config.JwtSecret, {
            expiresIn: 86400 //24hrs
        });

        //return token
        res.status(200).json({
            token: token,
        });

    } catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({
                error: "User exists",
                message: err.message,
            });
        }
        else {
            return res.status(500).json({
                error: "Internal server error",
                message: err.message,
            });
        }
    }
};

const updateProfile = async (req, res) => {
    // check if the body of the request contains all necessary properties
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }

    // handle the request
    try {
        // find and update user with id
        let user = await UserModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        ).exec();

        //create a token
        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            isPremium: user.isPremium,
            balance: user.balance,
            avatarUrl: user.avatarUrl,
        }, config.JwtSecret, {
            expiresIn: 86400, //24hrs
        });

        // return updated user
        return res.status(200).json({
            token: token,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
}

const logout = (req, res) => {
    res.status(200).send({ token: null });
}


const updateBalance = async (req, res) => {
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
        let user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { balance: req.body.balance },
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            isPremium: user.isPremium,
            balance: user.balance,
            avatarUrl: user.avatarUrl,
        }, config.JwtSecret, {
            expiresIn: 86400, //24hrs
        });

        // return updated user
        return res.status(200).json({
            token: token,
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

const getCompanionProfile = async (req, res) => {
    try {
        let companion = await CompanionModel.findById(req.params.id);
        if(!companion) {
            res.status(200).send({});
        }
        else {
            res.status(200).send({
                ratings: companion.ratings,
                reviewNumber: companion.reviewNumber,
                orderNumber: companion.orderNumber
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

const uploadImages = async (req, res) => {

    // first delete the previous image for the user
    let olduser = await UserModel.findById(req.params.id).exec();
    let avatarurl = olduser.avatarUrl;
    if (avatarurl) {
        let filename = (avatarurl).split("/uploadImages").pop();
        let filePath = path.join(process.cwd(), "/uploadImages" + filename);
        //to remove file from the link
        fs.unlink(filePath, function (err) {
            if (err) throw err;

        });
    }
    const url = req.protocol + '://' + req.get('host') + "/uploadImages/"
    //  const type = req.file.originalname.toLowerCase().split('.').pop();
    try {
        // find and update avatarUrl with id
        let user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { avatarUrl: (url + req.file.filename) },
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            isPremium: user.isPremium,
            balance: user.balance,
            avatarUrl: user.avatarUrl,
        }, config.JwtSecret, {
            expiresIn: 86400, //24hrs
        });

        // return updated user
        return res.status(200).json({
            token: token,
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }

}

const deleteImages = async (req, res) => {
    // check if the body of the request contains all necessary properties

    // handle the request

    try {
        // find and update avatarUrl with id
        let user = await UserModel.findById(req.params.id).exec();
        let url = user.avatarUrl;
        if (url) {
            let filename = (user.avatarUrl).split("/uploadImages").pop();
            let filePath = path.join(process.cwd(), "/uploadImages" + filename);
            //to remove file from the link
            fs.unlink(filePath, function (err) {
                if (err) throw err;

            });

            let updateduser = await UserModel.findByIdAndUpdate(
                req.params.id,
                { avatarUrl: null },
                {
                    new: true,
                    runValidators: true,
                }
            ).exec();


            const token = jwt.sign({
                _id: updateduser._id,
                username: updateduser.username,
                age: updateduser.age,
                gender: updateduser.gender,
                isPremium: updateduser.isPremium,
                balance: updateduser.balance,
                avatarUrl: updateduser.avatarUrl,
            }, config.JwtSecret, {
                expiresIn: 86400, //24hrs
            });


            return res.status(200).json({
                message: "avatar images deleted",
                token: token,
            });
        } else return res.status(200).json({
            message: "no avatar image for this user.",
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }

}

const updateStatus = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }
    try {
        let user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { onlineStatus: req.body.onlineStatus },
            {
                new: true,
                runValidators: true,
                    }
        ).exec();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
}




module.exports = {
    login,
    register,
    updateProfile,
    logout,
    updateBalance,
    uploadImages,
    deleteImages,
    getCompanionProfile,
    updateStatus,
};
"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const PostController = require("../controllers/post");

router.get("/", PostController.list); // List all posts

router.post(
    "/",
    middlewares.checkAuthentication,
    PostController.create
); // Create a new post, needs logged in user with the admin role

router.put(
    "/:id",
    middlewares.checkAuthentication,
    PostController.updatePost);

router.get("/:id", PostController.read); // Read a post by Id

router.delete(
    "/:id",
    middlewares.checkAuthentication,
    PostController.remove
); // Delete a post by Id, needs logged in user with the admin role


module.exports = router;
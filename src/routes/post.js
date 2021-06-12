"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const postController = require("../controllers/postController");

router.get( "/", postController.list);

router.post(
    "/",
    middlewares.checkAuthentication,
    postController.create
);

router.put(
    "/:id",
    middlewares.checkAuthentication,
    postController.updateStatus
);

router.get(
    "/:id",
    postController.read
);

router.delete(
    "/:id",
    middlewares.checkAuthentication,
    postController.remove
);

module.exports = router;
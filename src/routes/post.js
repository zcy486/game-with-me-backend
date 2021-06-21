"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const postController = require("../controllers/postController");

router.post(
    "/",
    middlewares.checkAuthentication,
    postController.create
);

router.post(
    "/ofgame",
    postController.listByGame
);

router.post(
    "/ofcompanion",
    postController.listByCompanion
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
"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const reviewController = require("../controllers/reviewController");

router.post(
    "/",
    middlewares.checkAuthentication,
    reviewController.create
);

router.put(
    "/:id",
    middlewares.checkAuthentication,
    reviewController.updateStatus
);

router.get(
    "/:id",
    reviewController.read
);

router.delete(
    "/:id",
    middlewares.checkAuthentication,
    reviewController.remove
);

module.exports = router;
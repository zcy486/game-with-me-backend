"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const reviewController = require("../controllers/reviewController");

router.post(
    "/",
    //middlewares.checkAuthentication,
    reviewController.create
);

router.put(
    "/:id",
    //middlewares.checkAuthentication,
    reviewController.updateReview
);

router.get(
    "/:id",
    reviewController.read
);
router.get("/companionId/:id", reviewController.readByCompanionId); //Read review list by companionId.

router.get("/orderId/:id", reviewController.readByOrderId); //Read review list by orderId.

router.delete(
    "/:id",
    middlewares.checkAuthentication,
    reviewController.remove
);

module.exports = router;
"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const PaymentController = require("../controllers/paymentController");

router.get("/", middlewares.checkAuthentication, PaymentController.list); // List all orders

router.post(
    "/",
    middlewares.checkAuthentication,
    PaymentController.create
); 

router.get("/:id", middlewares.checkAuthentication, PaymentController.read);

module.exports = router;
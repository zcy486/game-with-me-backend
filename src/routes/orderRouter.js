"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const OrderController = require("../controllers/orderController");

router.get("/", middlewares.checkAuthentication, OrderController.list); // List all orders

router.post(
    "/",
    middlewares.checkAuthentication,
    OrderController.create
); // Create a new order, needs logged in user with the admin role

router.put(
    "/:id",
    middlewares.checkAuthentication,
    OrderController.updateStatus);

router.get("/:id", OrderController.read); // Read a order by Id

router.get("/gamerId/:id", OrderController.readByUserId); //Read order list by gamerId.

router.delete(
    "/:id",
    middlewares.checkAuthentication,
    OrderController.remove
); // Delete a order by Id, needs logged in user with the admin role

//Get all the orders by the companion id.
router.get("/companion/:id", middlewares.checkAuthentication, OrderController.getCompanionOrders); // Read a order by Id


module.exports = router;
"use strict"

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const userController = require("../controllers/userController");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.put("/:id", middlewares.checkAuthentication, userController.updateProfile);
router.get("/logout", middlewares.checkAuthentication, userController.logout);
router.put("/balance/:id", middlewares.checkAuthentication, userController.updateBalance);
module.exports = router;

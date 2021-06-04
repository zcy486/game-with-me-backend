"use strict"

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const authController = require("../controllers/userAuth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/profile", middlewares.checkAuthentication, authController.profile);
router.get("/logout", middlewares.checkAuthentication, authController.profile);

module.exports = router;

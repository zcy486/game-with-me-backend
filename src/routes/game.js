"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const gameController = require("../controllers/gameController")

router.get( "/", gameController.list);
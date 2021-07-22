"use strict";

const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController")

router.get( "/", gameController.list);

router.get("/mostPopular", gameController.getMostPopularId);

router.get("/:id", gameController.getGameInfoById);

router.post("/getByName", gameController.getIdByName);

module.exports = router;
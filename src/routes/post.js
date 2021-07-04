"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const postController = require("../controllers/postController");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploadImages/');

    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + "-"+ file.originalname.toLowerCase()) 
      }
});  

const upload = multer({ storage: storage })


router.post(
    "/",
    middlewares.checkAuthentication,
    postController.create
);

router.post(
    "/filters",
    postController.listWithFilters
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

router.put(
    "/:id",
    middlewares.checkAuthentication,
    postController.updateStatus
);

router.post(
    "/image",
    upload.array("image"),
    middlewares.checkAuthentication,
    postController.uploadScreenshots,
);

module.exports = router;
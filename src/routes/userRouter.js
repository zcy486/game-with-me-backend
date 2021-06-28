"use strict"

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const userController = require("../controllers/userController");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploadImages/');
    },
});  

const upload = multer({ storage: storage })

router.post("/login", userController.login);
router.post("/register", userController.register);
router.put("/:id", middlewares.checkAuthentication, userController.updateProfile);
router.get("/logout", middlewares.checkAuthentication, userController.logout);
router.put("/balance/:id", middlewares.checkAuthentication, userController.updateBalance);
router.post("/image/:id", middlewares.checkAuthentication, upload.single("image"), userController.uploadImages);
module.exports = router;

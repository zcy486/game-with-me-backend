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
    filename: function (req, file, cb) {
        const type = file.originalname.toLowerCase().split('.').pop();

        //add extensions
        cb(null, Date.now() + "."+ type) 
      }
});  

const upload = multer({ storage: storage })

router.post("/login", userController.login);
router.post("/register", userController.register);
router.put("/:id", middlewares.checkAuthentication, userController.updateProfile);
router.get("/logout", middlewares.checkAuthentication, userController.logout);
router.put("/balance/:id", middlewares.checkAuthentication, userController.updateBalance);
router.post("/image/:id", middlewares.checkAuthentication, upload.single("image"), userController.uploadImages);
router.delete("/image/:id", middlewares.checkAuthentication, userController.deleteImages);
router.get("/companion/:id", middlewares.checkAuthentication, userController.getCompanionProfile);
router.put("/status/:id", middlewares.checkAuthentication, userController.updateStatus);
router.put("/updateorder/:id", middlewares.checkAuthentication, userController.updateCompanionOrderNumber);
router.get("/getbalance/:id", middlewares.checkAuthentication, userController.getBalance);
module.exports = router;

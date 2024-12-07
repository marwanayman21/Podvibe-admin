const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/home"); //callback func

router.get("/", homeController);

// router carries all routes
module.exports = router;

const express = require("express");
const router = express.Router();

const userEndpoint = require("../../api/user");

router.post("/signin", userEndpoint.AuthenticateUser); //login
router.post("/signup", userEndpoint.createUser); //sign up

module.exports = router;

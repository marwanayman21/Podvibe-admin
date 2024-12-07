const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");

const searchEndpoint = require("../../api/search");

router.get("/", auth, searchEndpoint.searchFunc);

module.exports = router;

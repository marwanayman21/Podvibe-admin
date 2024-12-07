const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");

const userEndpoint = require("../../api/user");

// router.post("/auth/signup", userEndpoint.createUser);
router.get("/", admin, userEndpoint.getAllUsers);
router.get("/:id", [validObjectId, auth], userEndpoint.getUserById);
router.put("/:id", [validObjectId, auth], userEndpoint.updateUserById);
router.delete("/:id", [validObjectId, auth], userEndpoint.deleteUserById);

router.get("/get/count", userEndpoint.getUserCount);

module.exports = router;

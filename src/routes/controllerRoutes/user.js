const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");

const userController = require("../../controllers/user");

// router.post("/", userEndpoint.createUser);
// router.get("/", admin, userEndpoint.getAllUsers);
// router.get("/:id", [validObjectId, auth], userEndpoint.getUserById);
// router.put("/:id", [validObjectId, auth], userEndpoint.updateUserById);
// router.delete("/:id", [validObjectId, auth], userEndpoint.deleteUserById);

// router.get("/get/count", userEndpoint.getUserCount);

router.get("/users", userController.renderMainView);

router.get("/users/logout", userController.logoutUser);

router.get("/users/create", userController.renderCreationView);
router.post("/users/create", userController.createUser);

router.get("/users/delete/:id", userController.deleteUserById);

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");
const uploader = require("../../middleware/multer");

const albumEndPoint = require("../../api/album");

const uploaderFiles = uploader.single("image"); //it will be carried inside req.file since it's single

router.post("/", [admin, uploaderFiles], albumEndPoint.createAlbum);
router.get("/", albumEndPoint.getAllAlbum);
router.get("/some",  albumEndPoint.getSomeAlbum);
router.delete("/:id", [validObjectId, admin], albumEndPoint.deleteAlbumById);
router.put("/add-audio", admin, albumEndPoint.addAudio);

router.get("/get/count", albumEndPoint.getAlbumCount);

module.exports = router;

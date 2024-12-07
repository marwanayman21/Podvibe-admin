const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");
const uploader = require("../../middleware/multer");

const audioEndPoint = require("../../api/audio");

const uploaderFiles = uploader.fields([
  { name: "image", maxCount: 1 }, //specifies that req.files.image will contain this image
  { name: "audio", maxCount: 1 },
]);

router.post("/", [admin, uploaderFiles], audioEndPoint.createAudio);
router.get("/",  audioEndPoint.getAllAudio);

router.get("/some", audioEndPoint.getSomeAudio);

router.put("/:id", [validObjectId, admin], audioEndPoint.updateAudioById);
router.delete("/:id", [validObjectId, admin], audioEndPoint.deleteAudioById);

router.put("/liked/:id", [validObjectId, auth], audioEndPoint.likeAudioById);
router.get("/liked", auth, audioEndPoint.getAllLikedAudio);

router.get("/get/count", audioEndPoint.getAudioCount);

module.exports = router;

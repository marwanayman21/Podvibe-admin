const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");

const uploader = require("../../middleware/multer");

const playlistEndPoint = require("../../api/playlist");

const uploaderFiles = uploader.single("image"); //it will be carried inside req.file since it's single

router.post("/", [auth, uploaderFiles], playlistEndPoint.createPlaylist);
router.put(
  "/edit/:id",
  [validObjectId, auth, uploaderFiles],
  playlistEndPoint.editPlaylistById
);

router.put("/add-audio", auth, playlistEndPoint.addAudio);

router.put("/remove-audio", auth, playlistEndPoint.removeAudio);

router.get("/favorite", auth, playlistEndPoint.getUserPlaylists);
router.get("/random", auth, playlistEndPoint.getRandomPlaylist);

//returns playlist and audios within this playlist
router.get("/",  playlistEndPoint.getAllPlaylists);

router.get("/some",  playlistEndPoint.getSomePlaylist);

router.get("/:id", [validObjectId, auth], playlistEndPoint.getPlaylistById);

router.delete(
  "/:id",
  [auth, validObjectId],
  playlistEndPoint.deletePlaylistById
);

router.get("/get/count", playlistEndPoint.getPlaylistCount);

module.exports = router;

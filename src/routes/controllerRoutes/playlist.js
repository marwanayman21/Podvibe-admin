const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validObjectId = require("../../middleware/validObjectId");
const uploader = require("../../middleware/multer");
const playlistController = require("../../controllers/playlist");

const uploaderFiles = uploader.single("image"); //it will be carried inside req.file since it's single

router.get("/playlists", playlistController.renderMainView);

router.get("/playlists/create", playlistController.renderCreationView);
router.post(
  "/playlists/create",
  uploaderFiles,
  playlistController.createPlaylist
);

router.get("/playlists/update/:id", playlistController.renderUpdateView);
router.post(
  "/playlists/update/:id",
  uploaderFiles,
  playlistController.editPlaylistById
);

router.get("/playlists/delete/:id", playlistController.deletePlaylistById);

//---------------------------------------------

//

//
/*
router.post("/", auth, playlistController.createPlaylist);
router.put("/edit/:id", [validObjectId], playlistController.editPlaylistById);

router.put("/add-audio", playlistController.addAudio);

router.put("/remove-audio", playlistController.removeAudio);

router.get("/favorite", playlistController.getUserPlaylists);
// router.get("/random", playlistController.getRandomPlaylist);

//returns playlist and audios within this playlist
router.get("/", playlistController.getAllPlaylists);

router.get("/:id", [validObjectId], playlistController.getPlaylistById);

router.delete("/:id", [validObjectId], playlistController.deletePlaylistById);

// router.get("/get/count", playlistController.getPlaylistCount);
*/
module.exports = router;

const express = require("express");
const router = express.Router();
// const admin = require("../../middleware/admin");
const uploader = require("../../middleware/multer");

const albumController = require("../../controllers/album");

const uploaderFiles = uploader.single("image"); //it will be carried inside req.file since it's single
const audioUploaderFiles = uploader.fields([
  { name: "image", maxCount: 1 }, //specifies that req.files.image will contain this image
  { name: "audio", maxCount: 1 },
]);

router.get("/albums", albumController.renderMainView);

router.get("/albums/create", albumController.renderCreationView);
router.post("/albums/create", uploaderFiles, albumController.createAlbum);

router.get("/albums/delete/:id", albumController.deleteAlbumById);

router.get("/albums/update/:id", albumController.renderUpdateView);
router.post(
  "/albums/update/:id",
  uploaderFiles,
  albumController.updateAlbumById
);

router.get("/albums/show-audios/:id", albumController.renderAudiosInAlbum);

router.get("/albums/add-audio/:id", albumController.renderAddAudioView);
router.post(
  "/albums/add-audio/:id",
  audioUploaderFiles,
  albumController.addAudio
);

router.get(
  "/playlists/delete/:audio_id/:album_id",
  albumController.deleteAudioFromAlbum
);

module.exports = router;

const { userModel } = require("../models/user");
const { playlistModel, validate } = require("../models/playlist");
const { audioModel } = require("../models/audio");
const cloudinary = require("cloudinary").v2;

const Joi = require("joi");

const renderMainView = async (req, res) => {
  try {
    const playlists = await playlistModel
      .find({})
      .select("name desc image")
      .populate("user", "name");
    res
      .status(200)
      .render("playlists/index", { playlists, activePage: "playlists" });
  } catch (err) {
    return res.status(400).render("error", {
      message: "Error while rendering Main View",
      back_url: "/playlists",
    });
  }
};

const renderCreationView = async (req, res) => {
  res.status(200).render("playlists/create", { activePage: "playlists" });
};

const renderUpdateView = async (req, res) => {
  const playlist = await playlistModel.findById(req.params.id);
  if (!playlist) {
    return res.status(400).render("error", {
      message: "Invalid Playlist Id to update",
      back_url: "/playlists",
    });
  }

  res
    .status(200)
    .render("playlists/update", { playlist, activePage: "playlists" });
};

const createPlaylist = async (req, res) => {
  try {
    const user = await userModel.findById(process.env.ADMIN_USER_ID);
    const imageFile = req.file;
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const playlist = await playlistModel({
      ...req.body,
      image: imageUpload.secure_url,
      user: user._id,
    }).save();

    user.playlists.push(playlist._id);

    await user.save();

    res.status(201).redirect("/playlists");
  } catch (err) {
    console.error(err);
    return res.status(400).render("error", {
      message: "Error while rendering Main View",
      back_url: "/playlists",
    });
  }
};

const editPlaylistById = async (req, res) => {
  const playlist = await playlistModel.findById(req.params.id);
  if (!playlist) {
    return res.status(400).render("error", {
      message: "Invalid Playlist Id to update",
      back_url: "/playlists",
    });
  }

  if (req.file) {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });
    playlist.image = uploadedImage.secure_url;
  }
  playlist.name = req.body.name;
  playlist.desc = req.body.desc;

  await playlist.save();

  res.status(201).redirect("/playlists");
};

const deletePlaylistById = async (req, res) => {
  try {
    const playlist = await playlistModel.findById(req.params.id);
    if (!playlist) {
      return res.status(404).send({ message: "Playlist not found" });
    }

    await userModel.updateMany(
      { playlists: req.params.id }, // Find users who have this playlist
      { $pull: { playlists: req.params.id } } // Remove the specific audio ID from the likedAudios array
    );

    await playlist.deleteOne();

    res.status(200).redirect("/playlists");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "An error occurred while deleting the album" });
  }
};

const addAudio = async (req, res) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    audioId: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.stauts(400).send({ message: error.details[0].message });
  }

  const user = await userModel.findById(req.user._id);
  const playlist = await playlistModel.findById(req.body.playlistId);

  if (!user._id.equals(playlist.user)) {
    //playlist.user contains the id of the owner user
    return res
      .status(403)
      .send({ message: "You don't have access to add audio!" });
  }

  if (playlist.audios.indexOf(req.body.audioId) === -1) {
    playlist.audios.push(req.body.audioId);
  } else {
    return res
      .status(400)
      .send({ message: "Audio already exists in this playlist" });
  }

  await playlist.save();
  res.status(200).send({ data: playlist, message: "Added to playlist" });
};

const removeAudio = async (req, res) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    audioId: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.stauts(400).send({ message: error.details[0].message });
  }

  const user = await userModel.findById(req.user._id);
  const playlist = await playlistModel.findById(req.body.playlistId);
  if (!user._id.equals(playlist.user)) {
    //playlist.user contains the id of the owner user
    return res
      .status(403)
      .send({ message: "You don't have access to remove audio!" });
  }

  const index = playlist.audios.indexOf(req.body.audioId);
  playlist.audios.splice(index, 1);
  await playlist.save();
  res
    .status(200)
    .send({ data: playlist, message: "Audio removed successfully" });
};

//CHECK ----------------------------------------------------
const getUserPlaylists = async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const playlists = await playlistModel.find({ _id: user.playlists });
  res.status(200).send({ data: playlists });
};

//returns playlist and audios within this playlist
const getPlaylistById = async (req, res) => {
  const playlist = await playlistModel.findById(req.params.id);
  if (!playlist) {
    return res.status(404).send("Not Found!");
  }
  const audios = await audioModel.find({ _id: playlist.audios });
  res.status(200).send({ data: { playlist, audios } });
};

module.exports = {
  createPlaylist,
  editPlaylistById,
  addAudio,
  removeAudio,
  getUserPlaylists,
  getPlaylistById,
  deletePlaylistById,
  renderMainView,
  renderCreationView,
  renderUpdateView,
};

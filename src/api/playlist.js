const { userModel } = require("../models/user");
const { playlistModel, validate } = require("../models/playlist");
const { audioModel } = require("../models/audio");

const Joi = require("joi");

const createPlaylist = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send({ messsage: error.details[0].message });
  }
  const user = await userModel.findById(req.user._id);

  const imageFile = req.file;
  const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    resource_type: "image",
  });
  playlist = await playlistModel({
    ...req.body,
    image: imageUpload,
    user: user._id,
  }).save();

  user.playlists.push(playlist._id);
  await user.save();

  res.status(201).send({ data: playlist });
};

const editPlaylistById = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().allow(""), //allow empty input
    image: Joi.string().allow(""),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const playlist = await playlistModel.findById(req.params.id);
  if (!playlist) {
    return res.status(404).send({ message: "Playlist not found" });
  }

  const user = await userModel.findById(req.user._id);

  if (!user._id.equals(playlist.user)) {
    return res.status(403).send({ message: "User don't have access to edit" });
  }
  playlist.name = req.body.name;
  playlist.desc = req.body.desc;
  playlist.image = req.body.image;

  await playlist.save();

  res.status(200).send({ message: "Updated successfully!" });
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

const getRandomPlaylist = async (req, res) => {
  const playlists = await playlistModel.aggregate([{ $sample: { size: 10 } }]);
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

const getAllPlaylists = async (req, res) => {
  const playlists = await playlistModel.find();
  res.status(200).send({ data: playlists });
};

const deletePlaylistById = async (req, res) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(404).send({ message: "Invalid User ID" });
  }

  const playlist = await playlistModel.findById(req.params.id);
  if (!user._id.equals(playlist.user)) {
    return res
      .status(403)
      .send({ message: "You don't have access to delete playlist" });
  }

  const index = user.playlists.indexOf(req.params.id);
  user.playlists.splice(index, 1);
  await user.save();
  await playlist.deleteOne();

  res.status(200).send({ message: "Removed from library " });
};

const getPlaylistCount = async (req, res) => {
  try {
    const playlists = await playlistModel.find();
    res.status(200).send({ success: true, count: playlists.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

const getSomePlaylist = async (req, res) => {
  try {
    const NRandomPlaylists = 6;

    const playlists = await playlistModel.aggregate([
      { $sample: { size: NRandomPlaylists } }
    ]);

    res.status(200).json({ success: true, data: playlists });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPlaylist,
  editPlaylistById,
  addAudio,
  removeAudio,
  getUserPlaylists,
  getRandomPlaylist,
  getPlaylistById,
  getAllPlaylists,
  deletePlaylistById,
  getPlaylistCount,
  getSomePlaylist,
};

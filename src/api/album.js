const { albumModel } = require("../models/album");
const cloudinary = require("cloudinary").v2;

const createAlbum = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const bgColor = req.body.bgColor;
    const imageFile = req.file;
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const albumData = {
      name,
      desc,
      bgColor,
      image: imageUpload.secure_url,
    };

    await albumModel(albumData).save();
    return res.status(201).json({
      success: true,
      message: "Album added succesfully",
      data: albumData,
    });
  } catch (err) {
    return res.status(400).json({ success: false, messsage: err });
  }
};

const getAllAlbum = async (req, res) => {
  try {
    const albums = await albumModel.find();
    res.status(200).json({ success: true, data: albums });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

const getSomeAlbum = async (req, res) => {
  try {
    const numberOfRandomAlbums = 6;

    const albums = await albumModel.aggregate([
      { $sample: { size: numberOfRandomAlbums } }
    ]);

    res.status(200).json({ success: true, data: albums });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteAlbumById = async (req, res) => {
  try {
    await albumModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Album deleted succesfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Album Delete Failed" });
  }
};

const addAudio = async (req, res) => {
  const album = await albumModel.findById(req.body.albumId);

  if (album.audios.indexOf(req.body.audioId) === -1) {
    album.audios.push(req.body.audioId);
  } else {
    return res
      .status(400)
      .send({ message: "Audio already exists in this album" });
  }

  await album.save();
  res.status(200).send({ data: album, message: "Added to album" });
};

const getAlbumCount = async (req, res) => {
  try {
    const albums = await albumModel.find();
    res.status(200).json({ success: true, count: albums.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

module.exports = {
  createAlbum,
  getAllAlbum,
  deleteAlbumById,
  addAudio,
  getAlbumCount,
  getSomeAlbum,
};

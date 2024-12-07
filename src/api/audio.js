const { userModel } = require("../models/user");
const { audioModel } = require("../models/audio");
const { albumModel } = require("../models/album");
const cloudinary = require("cloudinary").v2;

const createAudio = async (req, res) => {
  try {
    const album = req.body.albumId;

    const albumInstance = await albumModel.findById(album);
    if (!albumInstance) {
      return res
        .status(400)
        .json({ success: false, messsage: "Invalid Album Id" });
    }

    const name = req.body.name;
    const desc = req.body.desc;
    const performer = req.body.performer;
    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(
      audioUpload.duration % 60
    )}`;

    const audioData = {
      name,
      desc,
      album,
      performer,
      duration,
      image: imageUpload.secure_url,
      audio: audioUpload.secure_url,
    };

    const audioObj = await audioModel(audioData).save();
    albumInstance.audios.push(audioObj._id);

    await albumInstance.save();

    res.status(201).json({
      success: true,
      message: "Audio added succesfully",
      data: audioData,
    });
  } catch (err) {
    return res.status(400).json({ success: false, messsage: err });
  }
};

const getAllAudio = async (req, res) => {
  try {
    const audios = await audioModel.find();
    res.status(200).json({ success: true, data: audios });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

const deleteAudioById = async (req, res) => {
  try {
    await audioModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Audio deleted succesfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Audio Delete Failed" });
  }
};

const updateAudioById = async (req, res) => {
  const audio = await audioModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ data: audio, message: "Updated audio succesfully" });
};

const likeAudioById = async (req, res) => {
  let resMessage = "";

  const audio = await audioModel.findById(req.params.id);
  if (!audio) {
    return res.status(400).json({ message: "Audio does not exist" });
  }

  const user = await userModel.findById(req.user._id);
  const index = user.likedAudios.indexOf(audio._id);
  if (index === -1) {
    user.likedAudios.push(audio._id);
    resMessage = "Added to your liked Audios";
  } else {
    user.likedAudios.splice(index, 1);
    resMessage = "Removed from your liked Audios";
  }
  await user.save();
  res.status(200).json({ message: `${resMessage}` });
};

const getAllLikedAudio = async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const audios = await audioModel.find({ _id: user.likedAudios });

  res.status(200).json({ data: audios });
};

const getAudioCount = async (req, res) => {
  try {
    const audios = await audioModel.find();
    res.status(200).json({ success: true, count: audios.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

const getSomeAudio = async (req, res) => {
  try {
    const numberOfRandomAudios = 6;

    const audios = await audioModel.aggregate([
      { $sample: { size: numberOfRandomAudios } }
    ]);

    res.status(200).json({ success: true, data: audios });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAudio,
  getAllAudio,
  updateAudioById,
  deleteAudioById,
  likeAudioById,
  getAllLikedAudio,
  getAudioCount,
  getSomeAudio,
};

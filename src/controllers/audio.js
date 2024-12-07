const { userModel } = require("../models/user");
const { audioModel } = require("../models/audio");
const { albumModel } = require("../models/album");
const cloudinary = require("cloudinary").v2;

let audioIDToBeAddedToAlbum = null;

const renderMainView = async (req, res) => {
  try {
    const audios = await audioModel
      .find({})
      .select("name desc image performer duration")
      .populate("album", "name image"); // populate audios with only these attributes

    res.status(200).render("audios/index", { audios, activePage: "audios" });
  } catch (err) {
    return res.status(400).render("error", {
      message: "Error while rendering Main View",
      back_url: "/audios",
    });
  }
};

const renderCreationView = async (req, res) => {
  res.status(200).render("audios/create", { activePage: "audios" });
};

const renderUpdateView = async (req, res) => {
  const audio = await audioModel.findById(req.params.id);
  if (!audio) {
    return res.status(400).render("error", {
      message: "Invalid Audio Id to update",
      back_url: "/audios",
    });
  }

  res.status(200).render("audios/update", { audio, activePage: "audios" });
};

const renderAddAudioToAlbum = async (req, res) => {
  audioIDToBeAddedToAlbum = req.params.id;
  const audio = await audioModel.findById(audioIDToBeAddedToAlbum);
  const albums = await albumModel.find();
  if (!albums) {
    return res.status(400).render("error", {
      message: "Invalid Audio Id to update",
      back_url: "/audios",
    });
  }
  res
    .status(200)
    .render("audios/addAudioToAlbum", { albums, audio, activePage: "audios" });
};

const AddAudioToAlbum = async (req, res) => {
  try {
    const album = await albumModel.findById(req.params.id);
    if (!album) {
      audioIDToBeAddedToAlbum = null;
      return res.status(400).render("error", {
        message: "Can't Add audio to invalid album id",
        back_url: "/audios",
      });
    }

    const index = album.audios.indexOf(audioIDToBeAddedToAlbum);
    if (index === -1) {
      album.audios.push(audioIDToBeAddedToAlbum);
    } else {
      //audio already exists in this album
      res.status(200).redirect("/audios");
    }

    await album.save();

    //display success notification

    audioIDToBeAddedToAlbum = null;

    res.status(200).redirect("/audios");
  } catch (err) {
    audioIDToBeAddedToAlbum = null;
    return res.status(400).render("error", {
      message: "Error while adding audio to album",
      back_url: "/audios",
    });
  }
};

const createAudio = async (req, res) => {
  try {
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
    const duration = `${Math.floor(audioUpload.duration / 60)}:${
      audioUpload.duration % 60 < 10
        ? "0" + Math.floor(audioUpload.duration % 60)
        : Math.floor(audioUpload.duration % 60)
    }`;

    const audioData = {
      name,
      desc,
      performer,
      duration,
      image: imageUpload.secure_url,
      audio: audioUpload.secure_url,
    };

    await audioModel(audioData).save();

    res.status(201).redirect("/audios");
  } catch (err) {
    console.log(err);

    return res.status(400).render("error", {
      message: "Error happened while creating Audio",
      back_url: "/audios",
    });
  }
};

const deleteAudioById = async (req, res) => {
  try {
    const audio = await audioModel.findById(req.params.id);
    if (!audio) {
      return res.status(404).send({ message: "Audio not found" });
    }

    await userModel.updateMany(
      { likedAudios: req.params.id }, // Find users who have this playlist
      { $pull: { likedAudios: req.params.id } } // Remove the specific audio ID from the likedAudios array
    );

    await audio.deleteOne();
    // await audioModel.findByIdAndDelete(req.params.id);

    res.status(200).redirect("/audios");
  } catch (err) {
    res.status(400).render("error", {
      message: "Error happened while deleting Audio",
      back_url: "/audios",
    });
  }
};

const updateAudioById = async (req, res) => {
  try {
    const audioId = req.params.id;
    const audio = await audioModel.findById(audioId);

    if (!audio) {
      return res.status(400).render("error", {
        message: "Invalid Audio Id to update",
        back_url: "/audios",
      });
    }
    let audioData = { ...req.body };
    
    if (req.files.image) {
      const imageFile = req.files.image[0];
      const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      audioData.image = uploadedImage.secure_url;
    }
    await audioModel.findByIdAndUpdate(audioId, audioData, { new: true });
    res.status(201).redirect("/audios");
  } catch (err) {
    res.status(400).render("error", {
      message: "Error happened while updating Album",
      back_url: "/audios",
    });
  }
};

module.exports = {
  createAudio, //done
  updateAudioById,
  deleteAudioById,
  renderMainView, //done
  renderCreationView, //done
  renderUpdateView,
  renderAddAudioToAlbum,
  AddAudioToAlbum,
};

/*
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

  const getAllAudio = async (req, res) => {
    try {
      const audios = await audioModel.find();
      res.status(200).json({ success: true, data: audios });
    } catch (err) {
      res.status(400).json({ success: false, message: err });
    }
  };
*/

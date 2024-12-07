const { albumModel } = require("../models/album");
const { audioModel } = require("../models/audio");
const cloudinary = require("cloudinary").v2;

const renderMainView = async (req, res) => {
  /*const albums = await albumMethods.getAll({},{ ref: "audios", // reference songs array in album model
      fields: ["title", "description", "main_image"], // fields to return from album
      populate: { path: "songs", select: "name duration performer" }, }); */
  try {
    const albums = await albumModel.find({}).select("name desc image");
    // .populate("audios", "name performer image"); // populate audios with only these attributes

    res.status(200).render("albums/index", { albums, activePage: "albums" }); //passes albums as parameter to index file
  } catch (err) {
    return res.status(400).render("error", {
      message: "Error while rendering Main View",
      back_url: "/albums",
    });
  }
};

const renderCreationView = async (req, res) => {
  res.status(200).render("albums/create", { activePage: "albums" });
};

const renderUpdateView = async (req, res) => {
  const album = await albumModel.findById(req.params.id);
  if (!album) {
    return res.status(400).render("error", {
      message: "Invalid Album Id to update",
      back_url: "/albums",
    });
  }

  res.status(200).render("albums/update", { album, activePage: "albums" });
};

const createAlbum = async (req, res) => {
  try {
    const { name, desc, bgColor } = req.body;
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
    res.status(201).redirect("/albums");
  } catch (err) {
    return res.status(400).render("error", {
      message: "Error happened while creating Album",
      back_url: "/albums",
    });
  }
};

const updateAlbumById = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await albumModel.findById(albumId);
    if (!album) {
      return res.status(400).render("error", {
        message: "Invalid Album Id to update",
        back_url: "/albums",
      });
    }

    let albumData = { ...req.body };
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      albumData.image = uploadedImage.secure_url;
    }

    await albumModel.findByIdAndUpdate(albumId, albumData, { new: true });

    res.status(201).redirect("/albums");
  } catch (err) {
    res.status(400).render("error", {
      message: "Error happened while updating Album",
      back_url: "/albums",
    });
  }
};

const deleteAlbumById = async (req, res) => {
  try {
    const album = await albumModel.findById(req.params.id);
    if (!album) {
      return res.status(404).send({ message: "Album not found" });
    }

    await audioModel.updateMany(
      { album: req.params.id }, // Find audios that belong to this album
      { $unset: { album: "" } } // Remove the album field from those audios
    );

    await album.deleteOne();
    // await albumModel.findByIdAndDelete(req.params.id);

    res.status(200).redirect("/albums");
  } catch (err) {
    res.status(400).render("error", {
      message: "Error happened while deleting Album",
      back_url: "/albums",
    });
  }
};

//must receive album_id
const renderAddAudioView = async (req, res) => {
  const album = await albumModel.findById(req.params.id);
  if (!album) {
    res.status(400).render("error", {
      message: "Invalid Album Id to add audio in it",
      back_url: "/albums",
    });
  }
  res.status(200).render("albums/createaudio", { album, activePage: "albums" });
  // res.status(200).render("albums/create", { activePage: "albums" });
};

const addAudio = async (req, res) => {
  const album = await albumModel.findById(req.params.id);
  if (!album) {
    return res.status(400).render("error", {
      message: "Invalid Album Id",
      back_url: "/albums",
    });
  }

  // START CREATE AUDIO LOGIC
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
    performer,
    duration,
    album: req.params.id,
    image: imageUpload.secure_url,
    audio: audioUpload.secure_url,
  };

  audioObj = await audioModel(audioData).save();
  // END CREATE AUDIO LOGIC

  album.audios.push(audioObj._id);

  await album.save();
  res.status(200).redirect("/albums");
};

const renderAudiosInAlbum = async (req, res) => {
  try {
    const album = await albumModel.findById(req.params.id);
    if (!album) {
      return res.status(400).render("error", {
        message: "Invalid Album Id",
        back_url: "/albums",
      });
    }
    const audioIds = album.audios;

    const audios = await audioModel.find({ _id: { $in: audioIds } });
    res
      .status(200)
      .render("albums/audiosInAlbum", { album, audios, activePage: "albums" });
  } catch (err) {
    res.status(400).render("error", {
      message: `Error happened while rendering audios in Album`,
      back_url: "/albums",
    });
  }
};

const deleteAudioFromAlbum = async (req, res) => {
  try {
    const { audio_id, album_id } = req.params;

    await albumModel.findByIdAndUpdate(album_id, {
      $pull: { audios: audio_id },
    });

    res.status(200).redirect("/albums");
  } catch (err) {
    res.status(400).render("error", {
      message: `Error happened while deleting audios in Album`,
      back_url: "/albums",
    });
  }
};

module.exports = {
  renderMainView,
  renderCreationView,
  renderUpdateView,
  createAlbum,
  updateAlbumById,
  deleteAlbumById,
  renderAddAudioView,
  addAudio,
  renderAudiosInAlbum,
  deleteAudioFromAlbum,
};

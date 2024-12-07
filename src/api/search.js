const { playlistModel } = require("../models/playlist");
const { audioModel } = require("../models/audio");

const searchFunc = async (req, res) => {
  const search = req.query.search;
  if (search !== "") {
    const audios = await audioModel
      .find({
        name: { $regex: search, $options: "i" },
      })
      .limit(10);

    const playlists = await playlistModel
      .find({
        name: { $regex: search, $options: "i" },
      })
      .limit(10);

    const results = { audios, playlists };
    res.status(200).send({ data: results });
  } else {
    res.status(200).send({});
  }
};

module.exports = { searchFunc };

const mongoose = require("mongoose");
const Joi = require("joi");

const ObjectId = mongoose.Schema.Types.ObjectId;

const playListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: ObjectId, ref: "user", required: true }, //reference is user model
  desc: { type: String },
  audios: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "audio", //references audio model
    default: [],
  },
  image: { type: String },
});

const validate = (playList) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    user: Joi.string().required(),
    desc: Joi.string().allow(""),
    audios: Joi.array().items(Joi.string()), //array of strings
    image: Joi.string().allow(""),
  });
  return schema.validate(playList);
};

const playlistModel = mongoose.model("playList", playListSchema);

module.exports = { playlistModel, validate };

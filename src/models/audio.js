const mongoose = require("mongoose");
const Joi = require("joi");

const audioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  performer: { type: String, required: true },
  desc: { type: String, required: true },
  audio: { type: String, required: true }, //mp3 file
  image: { type: String, required: true }, //audio image
  duration: { type: String, default: 0 },
  album: { type: mongoose.Schema.Types.ObjectId, ref: "album" },
});

const validate = (audio) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    performer: Joi.string().required(),
    audio: Joi.string().required(),
    image: Joi.string().required(),
    duration: Joi.number().required(),
    album: Joi.string().required(),
  });
  return schema.validate(audio);
};

const audioModel =
  mongoose.models.audio || mongoose.model("audio", audioSchema);

module.exports = {
  audioModel,
  validate,
};

const mongoose = require("mongoose");
const Joi = require("joi");

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  bgColor: { type: String, required: true },
  image: { type: String, required: true }, //album image
  audios: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "audio",
    default: [],
  },
});

const validate = (album) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    bgColor: Joi.string().required(),
    image: Joi.string().required(),
  });
  return schema.validate(album);
};

const albumModel =
  mongoose.models.album || mongoose.model("album", albumSchema);

module.exports = {
  albumModel,
  validate,
};

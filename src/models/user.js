const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "please enter your name"] },
  email: {
    type: String,
    required: [true, "please enter your email"],
    unique: true,
  },
  password: { type: String, required: [true, "please enter your password"] },
  gender: { type: String, required: [true, "please enter your gender"] },
  date: { type: String, required: [true, "please enter your birth day"] },
  month: { type: String, required: [true, "please enter your birth month"] },
  year: { type: String, required: [true, "please enter your birth year"] },
  likedAudios: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "audio",
    default: [],
  }, //array of ids
  playlists: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "playlist",
    default: [],
  }, //array of ids
  isAdmin: { type: Boolean, default: false },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.name, isAdmin: this.isAdmin },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
  return token;
};

const validate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(10).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    month: Joi.string().required(),
    date: Joi.string().required(),
    year: Joi.string().required(),
    gender: Joi.string().valid("male", "female").required(),
  });
  return schema.validate(user);
};

const userModel = mongoose.model("user", userSchema);

module.exports = {
  userModel,
  validate,
};

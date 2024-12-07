const JWT = require("jsonwebtoken");

const { userModel, validate } = require("../models/user");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(409)
      .json({ message: "User with given email already exist!" });
  }
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  let newUser = await new userModel({
    ...req.body,
    password: hashedPassword,
  }).save();

  newUser.password = undefined;
  newUser.__v = undefined;

  res.status(200).json({
    success: true,
    data: newUser,
    message: "Account created successfuly!",
  });
};

const AuthenticateUser = async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    //not matching passwords
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = user.generateAuthToken();
  res.status(200).json({  status: "success", token: token, user:user });
};

const getAllUsers = async (req, res) => {
  const users = await userModel.find().select("-password-__v");
  res.status(200).send({ data: users });
};

const getUserById = async (req, res) => {
  const user = await userModel.findById(req.params.id).select("-password-__v");
  res.status(200).send({ data: user });
};

const updateUserById = async (req, res) => {
  const user = await userModel
    .findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .select("-password-__v");
  res.status(200).send({ data: user });
};

const deleteUserById = async (req, res) => {
  const user = await userModel.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Succesfully Deleted User" });
};

const getUserCount = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({ success: true, count: users.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

module.exports = {
  createUser,
  AuthenticateUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserCount,
};

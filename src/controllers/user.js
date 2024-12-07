const JWT = require("jsonwebtoken");

const { userModel, validate } = require("../models/user");
const bcrypt = require("bcrypt");

const renderMainView = async (req, res) => {
  try {
    const users = await userModel.find({}).select("name gender email isAdmin");
    // .select("name gender image likedAudios playlists");
    // .populate("audios", "name performer image"); // populate audios with only these attributes

    res.status(200).render("users/index", { users, activePage: "users" }); //passes albums as parameter to index file
  } catch (err) {
    return res.status(400).render("error", {
      message: "Error while rendering Main View",
      back_url: "/albums",
    });
  }
};

const logoutUser = (req, res) => {
  // Clear the token cookie
  res.clearCookie("token");

  // Redirect the user to the login page
  res.status(200).redirect("/register/signin");
};

const renderCreationView = async (req, res) => {
  res.status(200).render("users/create", { activePage: "users" });
};


const createUser = async (req, res) => {
  try{
  
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).render("error", {
        message: "User with given email already exist!",
        back_url: "/users",
      });
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const isAdmin = req.body.isAdmin === 'true';
    
    let newUser = await new userModel({
      ...req.body,
      isAdmin: isAdmin,
      password: hashedPassword,
    }).save();

    newUser.password = undefined;
     newUser.__v = undefined;
    res.status(201).redirect("/users");
  } catch(err){
      console.error(err);
      return res.status(400).render("error", {
        message: "Error while creating user",
        back_url: "/users",
      });
  }
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
  res.status(200).json({ data: token, message: "Signing in please wait..." });
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
  res.status(202).redirect("/users");
};

module.exports = {
  renderMainView,
  createUser,
  AuthenticateUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  renderCreationView,
  logoutUser,
};

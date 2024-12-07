require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");

/* Middlewares */
const adminCheck = require("./src/middleware/admin");
const cookieParser = require('cookie-parser');

/* End points (APIs)*/
const userEndpoint = require("./src/routes/apiRoutes/user");
const authEndpoint = require("./src/routes/apiRoutes/auth");
const audioEndpoint = require("./src/routes/apiRoutes/audio");
const playlistEndpoint = require("./src/routes/apiRoutes/playlist");
const searchEndpoint = require("./src/routes/apiRoutes/search");
const albumEndpoint = require("./src/routes/apiRoutes/album");
const connectCloudinary = require("./src/config/cloudinary");

/* Controller Routes (Admin routes) */
const mvcRoutes = require("./src/routes/controllerRoutes/mvcRoutes");
const albumRoutes = require("./src/routes/controllerRoutes/album");
const audioRoutes = require("./src/routes/controllerRoutes/audio");
const playlistRoutes = require("./src/routes/controllerRoutes/playlist");
const userRoutes = require("./src/routes/controllerRoutes/user");
const registerRoutes = require("./src/routes/controllerRoutes/authentication");

//app configuration
const app = express();
const port = process.env.PORT || 8081;

app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/`)); // in our case we wanted to give browser the global.css used in pug (which is translated to html) files.
app.use(express.static(`${__dirname}/src/views/js`));
connectDB();
connectCloudinary();

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //turn incoming requests into json format
app.use(cors()); //connects both front-end and back-end running on different ports
app.use(cookieParser()); // use cookie-parser before defining routes
app.use("/api/user", userEndpoint);
app.use("/api/auth", authEndpoint);
app.use("/api/audio", audioEndpoint);
app.use("/api/album", albumEndpoint);
app.use("/api/playlist", playlistEndpoint);
app.use("/api", searchEndpoint);

app.use(
  "/",
  //   registerRouter,
  //   protectedRoutes.protectedMVCRoutes,
  registerRoutes,
  adminCheck,
  mvcRoutes,
  userRoutes,
  albumRoutes,
  audioRoutes,
  playlistRoutes
);

app.listen(port, () => console.log(`Listening on port ${port}...`));
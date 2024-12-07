const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to ecommerce db on cloud");
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectDB;

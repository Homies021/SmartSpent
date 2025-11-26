const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },       // User's name
  email: { type: String, required: true, unique: true }, // Email must be unique
  password: { type: String, required: true },   // Password (you can hash it later)
});

module.exports = mongoose.model("User", userSchema);

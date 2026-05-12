const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  user: {
    type: String,
    required: true,
    unique: true
  },

  pass: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "user"
  }

});

module.exports = mongoose.model("User", UserSchema);
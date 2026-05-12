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

  rol: {
    type: String,
    enum: ["admin", "tecnico"],
    default: "tecnico"
  }

});

module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");

const TecnicoSchema = new mongoose.Schema({

  nombre: {

    type: String,

    required: true,

    unique: true

  }

}, {

  timestamps: true

});

module.exports = mongoose.model("Tecnico", TecnicoSchema);
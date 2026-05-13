const mongoose = require("mongoose");

const ProyectoSchema = new mongoose.Schema({

  numero: {
    type: String,
    required: true
  },

  sitio: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model("Proyecto", ProyectoSchema);
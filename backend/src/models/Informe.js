const mongoose = require("mongoose");

const InformeSchema = new mongoose.Schema({

  proyecto: String,

  sitio: String,

  descripcion: String,

  fecha: Date,

  fotos: [String],

  videos: [String]

}, {

  timestamps: true

});

module.exports = mongoose.model("Informe", InformeSchema);
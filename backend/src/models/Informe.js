const mongoose = require("mongoose");

const InformeSchema = new mongoose.Schema({

  proyecto: String,

  sitio: String,

  descripcion: String,

  // FECHA AUTOMÁTICA
  fechaCreacion: {

    type: Date,

    default: Date.now

  },

  // FECHA DE EJECUCIÓN
  fechaEjecucion: {

    type: Date,

    required: true

  },

  personas: [String],

  fotos: [String],

  videos: [String]

}, {

  timestamps: true

});

module.exports = mongoose.model("Informe", InformeSchema);
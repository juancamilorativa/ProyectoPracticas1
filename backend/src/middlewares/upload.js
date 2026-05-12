const multer = require("multer");

const path = require("path");

/* STORAGE */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "uploads/");

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

/* FILTROS */
const fileFilter = (req, file, cb) => {

  const tipos = /jpg|jpeg|png|mp4|mov/;

  const ext = tipos.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (ext) {

    return cb(null, true);

  }

  cb("Archivo no permitido");

};

const upload = multer({

  storage,

  fileFilter

});

module.exports = upload;
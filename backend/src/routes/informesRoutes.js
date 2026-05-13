const express = require("express");

const router = express.Router();

const informeController = require("../controllers/informesController");

const upload = require("../middlewares/upload");

/* OBTENER INFORMES */
router.get("/", informeController.obtenerInformes);

/* MULTIPLES ARCHIVOS */
router.post(

  "/",

  upload.array("fotos", 20),

  informeController.crearInforme

);

module.exports = router;
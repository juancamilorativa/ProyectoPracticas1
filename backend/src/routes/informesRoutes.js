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

router.put("/:id", informeController.editarInforme);
router.delete("/:id", informeController.eliminarInforme);

module.exports = router;
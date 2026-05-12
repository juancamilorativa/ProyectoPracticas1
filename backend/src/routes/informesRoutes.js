const express = require("express");

const router = express.Router();

const informeController = require("../controllers/informesController");

const upload = require("../middlewares/upload");

/* MULTIPLES ARCHIVOS */
router.post(

  "/",

  upload.array("archivos", 20),

  informeController.crearInforme

);

module.exports = router;
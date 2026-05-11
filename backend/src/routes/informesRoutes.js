const express = require("express");
const router = express.Router();

const controller = require("../controllers/informesController");


/* LISTAR INFORMES */
router.get("/", controller.getInformes);


/* CREAR INFORME */
router.post("/", controller.crearInforme);


/* BUSQUEDA AVANZADA */
router.get("/buscar", controller.buscarInformes);


module.exports = router;
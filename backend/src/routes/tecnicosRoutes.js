const express = require("express");

const router = express.Router();

const tecnicoController = require("../controllers/tecnicosController");

router.get("/", tecnicoController.getTecnicos);

router.post("/", tecnicoController.addTecnico);

router.delete("/:id", tecnicoController.deleteTecnico);

module.exports = router;
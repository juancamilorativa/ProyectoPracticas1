const express = require("express");
const router = express.Router();

const { verifyToken, soloAdmin } = require("../middlewares/auth");
const {
 getTecnicos,
 createTecnico,
 deleteTecnico
} = require("../controllers/tecnicos.controller");

router.get("/", verifyToken, getTecnicos);
router.post("/", verifyToken, soloAdmin, createTecnico);
router.delete("/:id", verifyToken, soloAdmin, deleteTecnico);

module.exports = router;
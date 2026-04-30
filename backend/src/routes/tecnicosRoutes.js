const express = require("express");
const router = express.Router();

const { verifyToken, soloAdmin } = require("../middlewares/authMiddleware");
const {
  getTecnicos,
  addTecnico,
  deleteTecnico
} = require("../controllers/tecnicosController");

router.get("/", verifyToken, getTecnicos);
router.post("/", verifyToken, soloAdmin, addTecnico);
router.delete("/:id", verifyToken, soloAdmin, deleteTecnico);

module.exports = router;
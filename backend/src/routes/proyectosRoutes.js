const express = require("express");
const router = express.Router();

const { verifyToken, soloAdmin } = require("../middlewares/authMiddleware");
const {
  getProyectos,
  addProyecto,
  deleteProyecto
} = require("../controllers/proyectosController");

router.get("/", verifyToken, getProyectos);
router.post("/", verifyToken, soloAdmin, addProyecto);
router.delete("/:id", verifyToken, soloAdmin, deleteProyecto);

module.exports = router;
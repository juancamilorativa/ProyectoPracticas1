const express = require("express");
const router = express.Router();

const { verifyToken, soloAdmin } = require("../middlewares/auth");
const {
 getProyectos,
 createProyecto,
 deleteProyecto
} = require("../controllers/proyectos.controller");

router.get("/", verifyToken, getProyectos);
router.post("/", verifyToken, soloAdmin, createProyecto);
router.delete("/:id", verifyToken, soloAdmin, deleteProyecto);

module.exports = router;
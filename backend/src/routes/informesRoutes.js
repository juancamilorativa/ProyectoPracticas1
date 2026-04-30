const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const {
  getInformes,
  buscarInformes
} = require("../controllers/informesController");

router.get("/", verifyToken, getInformes);
router.get("/buscar", verifyToken, buscarInformes);

module.exports = router;
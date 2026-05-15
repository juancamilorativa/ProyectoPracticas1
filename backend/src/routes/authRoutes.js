const express = require("express");

const router = express.Router();

const {
  login,
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
  recuperarPassword,
  resetPassword
} = require("../controllers/authController");

const {
  verifyToken,
  soloAdmin
} = require("../middlewares/authMiddleware");

/* LOGIN */
router.post("/login", login);

/* CREAR USUARIO */
router.post("/register", crearUsuario);

/* USUARIOS */
router.get(
  "/usuarios",
  verifyToken,
  soloAdmin,
  obtenerUsuarios
);

router.delete(
  "/usuarios/:id",
  verifyToken,
  soloAdmin,
  eliminarUsuario
);

/* RECUPERAR */
router.post("/forgot-password", recuperarPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
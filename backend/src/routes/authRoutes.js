const express = require("express");

const router = express.Router();

const auth = require("../controllers/authController");

router.post("/login", auth.login);

router.post("/crear-usuario", auth.crearUsuario);

router.get("/usuarios", auth.obtenerUsuarios);

router.delete("/usuarios/:id", auth.eliminarUsuario);

router.post("/recuperar", auth.recuperarPassword);

router.post("/reset-password", auth.resetPassword);

module.exports = router;
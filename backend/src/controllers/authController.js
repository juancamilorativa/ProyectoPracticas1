const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

/* REGISTER */


 exports.register = async (req, res) => {
  try {

    console.log("🔥 BODY RECIBIDO:", req.body);

    const { user, pass, rol } = req.body || {};

    if (!user || !pass) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos"
      });
    }

  

    const existe = await User.findOne({ user });

    if (existe) {
      return res.status(400).json({ ok: false, error: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(pass, 10);

    const nuevoUsuario = new User({
      user,
      pass: hash,
      rol: rol || "tecnico"
    });

    await nuevoUsuario.save();

    res.json({ ok: true, data: "Usuario creado" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

   

  
/* LOGIN */
exports.login = async (req, res) => {

  try {

    const { user, pass } = req.body;

    /* BUSCAR USUARIO */
    const usuario = await User.findOne({ user });

    if (!usuario) {

      return res.status(401).json({
        ok: false,
        error: "Login incorrecto"
      });

    }

    /* COMPARAR PASSWORD */
    const valid = await bcrypt.compare(pass, usuario.pass);

    if (!valid) {

      return res.status(401).json({
        ok: false,
        error: "Login incorrecto"
      });

    }

    /* TOKEN */
    const token = jwt.sign(

      {
        id: usuario._id,
        role: usuario.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "8h"
      }

    );

    res.json({

      ok: true,

      data: {

        token,
        role: usuario.role

      }

    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};
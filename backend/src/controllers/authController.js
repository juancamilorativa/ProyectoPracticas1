const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const nodemailer = require("nodemailer");

/* LOGIN */
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(401).json({
        ok: false,
        error: "Usuario no encontrado"
      });

    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {

      return res.status(401).json({
        ok: false,
        error: "Contraseña incorrecta"
      });

    }

    const token = jwt.sign({

      id: user._id,
      rol: user.rol

    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" });

    res.json({

      ok: true,

      data: {
        token,
        rol: user.rol
      }

    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* CREAR USUARIO */
exports.crearUsuario = async (req, res) => {

  try {

    const {

      email,
      password,
      rol

    } = req.body;

    const existe = await User.findOne({ email });

    if (existe) {

      return res.json({
        ok: false,
        error: "El usuario ya existe"
      });

    }

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new User({

      email,

      password: hash,

      rol

    });

    await nuevo.save();

    res.json({

      ok: true,

      mensaje: "Usuario creado"

    });

  } catch (error) {

    res.status(500).json({

      ok: false,
      error: error.message

    });

  }

};

/* LISTAR */
exports.obtenerUsuarios = async (req, res) => {

  try {

    const users = await User.find()
      .select("-password");

    res.json({
      ok: true,
      data: users
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* ELIMINAR */
exports.eliminarUsuario = async (req, res) => {

  try {

    await User.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      mensaje: "Usuario eliminado"
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* RECUPERAR */
exports.recuperarPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.json({
        ok: false,
        error: "Correo no encontrado"
      });

    }

    const token = crypto
      .randomBytes(20)
      .toString("hex");

    user.resetToken = token;

    user.resetTokenExpire =
      Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

      }

    });

    const link =
      `http://localhost:5500/reset.html?token=${token}`;

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Recuperar contraseña",

      html: `
      <h2>Recuperación</h2>

      <a href="${link}">
        Restablecer contraseña
      </a>
      `

    });

    res.json({

      ok: true,
      mensaje: "Correo enviado"

    });

  } catch (error) {

    res.status(500).json({

      ok: false,
      error: error.message

    });

  }

};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {

  try {

    const {

      token,
      password

    } = req.body;

    const user = await User.findOne({

      resetToken: token,

      resetTokenExpire: {
        $gt: Date.now()
      }

    });

    if (!user) {

      return res.json({

        ok: false,
        error: "Token inválido"

      });

    }

    const hash = await bcrypt.hash(password, 10);

    user.password = hash;

    user.resetToken = undefined;

    user.resetTokenExpire = undefined;

    await user.save();

    res.json({

      ok: true,
      mensaje: "Contraseña actualizada"

    });

  } catch (error) {

    res.status(500).json({

      ok: false,
      error: error.message

    });

  }

};
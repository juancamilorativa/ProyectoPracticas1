const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const nodemailer = require("nodemailer");

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {

  try {

    const { correo, password } = req.body;

    if (!correo || !password) {

      return res.status(400).json({
        ok: false,
        error: "Campos incompletos"
      });

    }

    const user = await User.findOne({ correo });

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

        rol: user.rol,

        nombre: user.nombre,

        correo: user.correo

      }

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};

/* =========================
   CREAR USUARIO
========================= */
exports.crearUsuario = async (req, res) => {

  try {

    const {

      nombre,
      correo,
      password,
      rol

    } = req.body;

    if (
      !nombre ||
      !correo ||
      !password ||
      !rol
    ) {

      return res.status(400).json({
        ok: false,
        error: "Campos incompletos"
      });

    }

    const existe = await User.findOne({ correo });

    if (existe) {

      return res.status(400).json({
        ok: false,
        error: "El usuario ya existe"
      });

    }

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new User({

      nombre,

      correo,

      password: hash,

      rol

    });

    await nuevo.save();

    res.json({

      ok: true,

      mensaje: "Usuario creado",

      data: nuevo

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};

/* =========================
   LISTAR USUARIOS
========================= */
exports.obtenerUsuarios = async (req, res) => {

  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

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

/* =========================
   ELIMINAR USUARIO
========================= */
exports.eliminarUsuario = async (req, res) => {

  try {

    const { id } = req.params;

    await User.findByIdAndDelete(id);

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

/* =========================
   RECUPERAR PASSWORD
========================= */
exports.recuperarPassword = async (req, res) => {

  try {

    const { correo } = req.body;

    if (!correo) {

      return res.status(400).json({
        ok: false,
        error: "Correo requerido"
      });

    }

    const user = await User.findOne({ correo });

    if (!user) {

      return res.status(404).json({
        ok: false,
        error: "Correo no encontrado"
      });

    }

    const token = crypto
      .randomBytes(20)
      .toString("hex");

    user.resetToken = token;

    user.resetTokenExpira =
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

      to: correo,

      subject: "Recuperar contraseña",

      html: `
        <h2>Recuperación de contraseña</h2>

        <p>Haz clic en el siguiente enlace:</p>

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

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {

  try {

    const {

      token,
      password

    } = req.body;

    if (!token || !password) {

      return res.status(400).json({
        ok: false,
        error: "Datos incompletos"
      });

    }

    const user = await User.findOne({

      resetToken: token,

      resetTokenExpira: {
        $gt: Date.now()
      }

    });

    if (!user) {

      return res.status(400).json({

        ok: false,

        error: "Token inválido o expirado"

      });

    }

    const hash = await bcrypt.hash(password, 10);

    user.password = hash;

    user.resetToken = undefined;

    user.resetTokenExpira = undefined;

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
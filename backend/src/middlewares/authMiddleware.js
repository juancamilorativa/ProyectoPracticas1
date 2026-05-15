const jwt = require("jsonwebtoken");

/* =========================
   VERIFICAR TOKEN
========================= */
const verifyToken = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        ok: false,
        error: "Token requerido"
      });

    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      ok: false,
      error: "Token inválido"
    });

  }

};

/* =========================
   SOLO ADMIN
========================= */
const soloAdmin = (req, res, next) => {

  try {

    if (req.user.rol !== "admin") {

      return res.status(403).json({
        ok: false,
        error: "Acceso denegado"
      });

    }

    next();

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* =========================
   EXPORTAR
========================= */
module.exports = {
  verifyToken,
  soloAdmin
};
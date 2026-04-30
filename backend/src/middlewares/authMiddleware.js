const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(403).json({ ok: false, error: "No token" });

  const token = auth.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, dec) => {
    if (err) return res.status(403).json({ ok: false, error: "Token inválido" });
    req.user = dec;
    next();
  });
};

const soloAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, error: "No autorizado" });
  }
  next();
};

module.exports = { verifyToken, soloAdmin };
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { user, pass, role } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ ok: false, error: "Faltan datos" });
  }

  try {
    const hash = await bcrypt.hash(pass, 10);

    db.query(
      "INSERT INTO usuarios(user, pass, role) VALUES (?,?,?)",
      [user, hash, role || "user"],
      err => {
        if (err) return res.json({ ok: false, error: err.message });
        res.json({ ok: true, data: "Usuario creado" });
      }
    );
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
};

exports.login = (req, res) => {
  const { user, pass } = req.body;

  db.query("SELECT * FROM usuarios WHERE user=?", [user], async (err, r) => {
    if (err) return res.json({ ok: false, error: err.message });
    if (!r.length) return res.status(401).json({ ok: false, error: "Login incorrecto" });

    const usuario = r[0];
    const valid = await bcrypt.compare(pass, usuario.pass);

    if (!valid) {
      return res.status(401).json({ ok: false, error: "Login incorrecto" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ ok: true, data: { token, role: usuario.role } });
  });
};
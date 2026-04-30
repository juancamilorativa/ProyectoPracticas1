const db = require("../config/db");

exports.getTecnicos = (req, res) => {
  db.query("SELECT * FROM tecnicos", (e, r) => res.json({ ok: true, data: r }));
};

exports.addTecnico = (req, res) => {
  const { nombre } = req.body;

  db.query("SELECT * FROM tecnicos WHERE nombre=?", [nombre], (e, r) => {
    if (r.length > 0) return res.json({ ok: false, error: "Ya existe" });

    db.query("INSERT INTO tecnicos(nombre) VALUES(?)", [nombre], () =>
      res.json({ ok: true })
    );
  });
};

exports.deleteTecnico = (req, res) => {
  db.query("DELETE FROM tecnicos WHERE id=?", [req.params.id], () =>
    res.json({ ok: true })
  );
};
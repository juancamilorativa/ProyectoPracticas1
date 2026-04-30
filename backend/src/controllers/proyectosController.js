const db = require("../config/db");

exports.getProyectos = (req, res) => {
  db.query("SELECT * FROM proyectos", (e, r) =>
    res.json({ ok: true, data: r })
  );
};

exports.addProyecto = (req, res) => {
  const { numero, sitio } = req.body;

  db.query("SELECT * FROM proyectos WHERE numero=?", [numero], (e, r) => {
    if (r.length > 0)
      return res.json({ ok: false, error: "Proyecto ya existe" });

    db.query(
      "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
      [numero, sitio],
      () => res.json({ ok: true })
    );
  });
};

exports.deleteProyecto = (req, res) => {
  db.query("DELETE FROM proyectos WHERE id=?", [req.params.id], () =>
    res.json({ ok: true })
  );
};
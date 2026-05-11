const db = require("../config/db");


/* LISTAR */
exports.getProyectos = (req, res) => {

  const sql = "SELECT * FROM proyectos ORDER BY id DESC";

  db.query(sql, (err, results) => {

    if (err) {
      return res.json({
        ok: false,
        error: err.message
      });
    }

    res.json({
      ok: true,
      data: results
    });

  });

};


/* CREAR */
exports.addProyecto = (req, res) => {

  const { nombre } = req.body;

  if (!nombre) {

    return res.json({
      ok: false,
      mensaje: "El nombre es obligatorio"
    });

  }

  const sql = `
    INSERT INTO proyectos(nombre)
    VALUES(?)
  `;

  db.query(sql, [nombre], (err, result) => {

    if (err) {

      return res.json({
        ok: false,
        error: err.message
      });

    }

    res.json({
      ok: true,
      mensaje: "Proyecto agregado",
      id: result.insertId
    });

  });

};


/* ELIMINAR */
exports.deleteProyecto = (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM proyectos
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {

    if (err) {

      return res.json({
        ok: false,
        error: err.message
      });

    }

    res.json({
      ok: true,
      mensaje: "Proyecto eliminado"
    });

  });

};
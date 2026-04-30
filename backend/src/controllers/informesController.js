const db = require("../config/db");

/* LISTAR */
exports.getInformes = (req, res) => {
  const sql = `
    SELECT 
      i.*,
      GROUP_CONCAT(t.nombre SEPARATOR ', ') AS responsables
    FROM informes i
    LEFT JOIN informe_tecnicos it ON i.id = it.informe_id
    LEFT JOIN tecnicos t ON it.tecnico_id = t.id
    GROUP BY i.id
    ORDER BY i.fecha DESC
  `;

  db.query(sql, (err, r) => {
    if (err) return res.json({ ok: false, error: err.message });
    res.json({ ok: true, data: r });
  });
};

/* BUSQUEDA AVANZADA */
exports.buscarInformes = (req, res) => {
  let {
    q,
    fechaInicio,
    fechaFin,
    tecnico,
    page = 1,
    limit = 10
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let condiciones = [];
  let valores = [];

  if (q) {
    condiciones.push("(i.proyecto LIKE ? OR i.sitio LIKE ? OR i.descripcion LIKE ?)");
    valores.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (fechaInicio && fechaFin) {
    condiciones.push("i.fecha BETWEEN ? AND ?");
    valores.push(fechaInicio, fechaFin);
  }

  if (tecnico) {
    condiciones.push("t.id = ?");
    valores.push(tecnico);
  }

  let where = condiciones.length ? "WHERE " + condiciones.join(" AND ") : "";

  const sql = `
    SELECT 
      i.*,
      GROUP_CONCAT(t.nombre SEPARATOR ', ') AS responsables
    FROM informes i
    LEFT JOIN informe_tecnicos it ON i.id = it.informe_id
    LEFT JOIN tecnicos t ON it.tecnico_id = t.id
    ${where}
    GROUP BY i.id
    ORDER BY i.fecha DESC
    LIMIT ? OFFSET ?
  `;

  valores.push(limit, offset);

  db.query(sql, valores, (err, results) => {
    if (err) return res.json({ ok: false, error: err.message });

    res.json({
      ok: true,
      page,
      limit,
      data: results
    });
  });
};
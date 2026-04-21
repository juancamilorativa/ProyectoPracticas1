require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   MYSQL
========================= */
const db = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME,
 port: process.env.DB_PORT
});

db.connect(err => {
 if (err) console.log("❌ DB error:", err);
 else console.log("✅ MySQL conectado");
});

/* =========================
   RESPUESTAS
========================= */
function ok(res, data = {}) {
 return res.json({ ok: true, data });
}
function fail(res, msg = "Error", code = 500) {
 return res.status(code).json({ ok: false, error: msg });
}

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {

 const { user, pass } = req.body;

 db.query(
  "SELECT * FROM usuarios WHERE user=? AND pass=?",
  [user, pass],
  (err, result) => {

   if (err) return fail(res, err.message);
   if (!result.length) return fail(res, "Login incorrecto", 401);

   const u = result[0];

   const token = jwt.sign(
    { id: u.id, role: u.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
   );

   ok(res, { token, role: u.role, user: u.user });
  }
 );
});

/* =========================
   TOKEN
========================= */
function verifyToken(req, res, next) {

 const auth = req.headers["authorization"];
 if (!auth) return fail(res, "No token", 403);

 const token = auth.split(" ")[1];

 jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) return fail(res, "Token inválido", 403);
  req.user = decoded;
  next();
 });
}

/* =========================
   SOLO ADMIN
========================= */
function soloAdmin(req, res, next) {
 if (req.user.role !== "admin")
  return fail(res, "No autorizado", 403);
 next();
}

/* =========================
   TECNICOS
========================= */
app.get("/tecnicos", verifyToken, (req, res) => {
 db.query("SELECT * FROM tecnicos", (err, r) => {
  if (err) return fail(res, err.message);
  ok(res, r);
 });
});

app.post("/tecnicos", verifyToken, soloAdmin, (req, res) => {

 db.query(
  "INSERT INTO tecnicos(nombre) VALUES(?)",
  [req.body.nombre],
  (err, result) => {
   if (err) return fail(res, err.message);
   ok(res, { id: result.insertId });
  }
 );
});

/* =========================
   PROYECTOS
========================= */
app.get("/proyectos", verifyToken, (req, res) => {
 db.query("SELECT * FROM proyectos", (err, r) => {
  if (err) return fail(res, err.message);
  ok(res, r);
 });
});

app.post("/proyectos", verifyToken, soloAdmin, (req, res) => {

 db.query(
  "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
  [req.body.numero, req.body.sitio],
  (err, result) => {
   if (err) return fail(res, err.message);
   ok(res, { id: result.insertId });
  }
 );
});

/* =========================
   MULTER
========================= */
const storage = multer.diskStorage({
 destination: "uploads/",
 filename: (req, file, cb) => {
  cb(null, Date.now() + "-" + file.originalname);
 }
});
const upload = multer({ storage });

/* =========================
   INFORMES
========================= */
app.get("/informes", verifyToken, (req, res) => {
 db.query("SELECT * FROM informes ORDER BY id DESC", (err, r) => {
  if (err) return fail(res, err.message);
  ok(res, r);
 });
});

app.post("/informes", verifyToken, upload.array("fotos"), (req, res) => {

 const { proyecto, sitio, fecha, descripcion, personas } = req.body;

 const fotos = req.files?.map(f => f.filename).join(",") || "";

 db.query(
  "INSERT INTO informes(proyecto,sitio,fecha,descripcion,personas,fotos) VALUES (?,?,?,?,?,?)",
  [proyecto, sitio, fecha, descripcion, personas, fotos],
  (err, result) => {
   if (err) return fail(res, err.message);
   ok(res, { id: result.insertId });
  }
 );
});

/* EDITAR */
app.put("/informes/:id", verifyToken, (req, res) => {

 const { fecha, descripcion } = req.body;

 db.query(
  "UPDATE informes SET fecha=?, descripcion=? WHERE id=?",
  [fecha, descripcion, req.params.id],
  (err) => {
   if (err) return fail(res, err.message);
   ok(res);
  }
 );
});

/* ELIMINAR */
app.delete("/informes/:id", verifyToken, (req, res) => {

 db.query(
  "DELETE FROM informes WHERE id=?",
  [req.params.id],
  (err) => {
   if (err) return fail(res, err.message);
   ok(res);
  }
 );
});

/* ========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 API running " + PORT));
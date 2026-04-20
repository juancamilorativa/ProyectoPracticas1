require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();

/* =========================
   CONFIG
========================= */
app.use(cors({ origin: "*"}));
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
   RESPUESTAS SEGURAS
========================= */
function ok(res, data = {}) {
 return res.json({ ok: true, data });
}

function fail(res, msg = "Error servidor", code = 500) {
 return res.status(code).json({ ok: false, error: msg });
}

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {

 const { user, pass } = req.body;

 if (!user || !pass) return fail(res, "Datos incompletos", 400);

 db.query(
  "SELECT * FROM usuarios WHERE user=? AND pass=?",
  [user, pass],
  (err, result) => {

   if (err) return fail(res, err.message);
   if (result.length === 0) return fail(res, "Login incorrecto", 401);

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
   TECNICOS
========================= */
app.get("/tecnicos", verifyToken, (req, res) => {
 db.query("SELECT * FROM tecnicos", (err, r) => {
  if (err) return fail(res, err.message);
  ok(res, r);
 });
});

app.post("/tecnicos", verifyToken, (req, res) => {

 if (!req.body.nombre) return fail(res, "Nombre requerido", 400);

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

app.post("/proyectos", verifyToken, (req, res) => {

 const { numero, sitio } = req.body;

 if (!numero || !sitio) return fail(res, "Campos incompletos", 400);

 db.query(
  "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
  [numero, sitio],
  (err, result) => {
   if (err) return fail(res, err.message);
   ok(res, { id: result.insertId });
  }
 );
});

/* =========================
   INFORMES
========================= */
const storage = multer.diskStorage({
 destination: "uploads/",
 filename: (req, file, cb) => {
  cb(null, Date.now() + "-" + file.originalname);
 }
});

const upload = multer({ storage });

app.get("/informes", verifyToken, (req, res) => {
 db.query("SELECT * FROM informes ORDER BY id DESC", (err, r) => {
  if (err) return fail(res, err.message);
  ok(res, r);
 });
});

app.post("/informes", verifyToken, upload.array("fotos"), (req, res) => {

 const { proyecto, sitio, fecha, descripcion } = req.body;

 if (!proyecto || !fecha || !descripcion) {
  return fail(res, "Datos incompletos", 400);
 }

 db.query(
  "INSERT INTO informes(proyecto,sitio,fecha,descripcion) VALUES (?,?,?,?)",
  [proyecto, sitio, fecha, descripcion],
  (err, result) => {
   if (err) return fail(res, err.message);
   ok(res, { id: result.insertId });
  }
 );
});

/* =========================
   ERROR GLOBAL
========================= */
app.use((err, req, res, next) => {
 console.error(err);
 res.status(500).json({ ok: false, error: "Error interno" });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("🚀 API running on " + PORT);
});
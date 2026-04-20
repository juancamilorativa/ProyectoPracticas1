require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   🔌 MYSQL (CORRECTO SIMPLE)
========================= */
const db = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME,
 port: process.env.DB_PORT
});

db.connect((err) => {
 if (err) {
  console.log("❌ DB error:", err);
 } else {
  console.log("✅ MySQL conectado");
 }
});

/* =========================
   🔐 LOGIN
========================= */
app.post("/login", (req, res) => {
 const { user, pass } = req.body;

 db.query(
  "SELECT * FROM usuarios WHERE user=? AND pass=?",
  [user, pass],
  (err, result) => {
   if (err) return res.status(500).send("Error");
   if (result.length === 0) return res.status(401).send("Error login");

   res.json(result[0]);
  }
 );
});

/* =========================
   👷 TECNICOS
========================= */
app.get("/tecnicos", (req, res) => {
 db.query("SELECT * FROM tecnicos", (err, r) => {
  res.json(r);
 });
});

app.post("/tecnicos", (req, res) => {
 db.query(
  "INSERT INTO tecnicos(nombre) VALUES(?)",
  [req.body.nombre],
  () => res.sendStatus(200)
 );
});

app.delete("/tecnicos/:id", (req, res) => {
 db.query(
  "DELETE FROM tecnicos WHERE id=?",
  [req.params.id],
  () => res.sendStatus(200)
 );
});

/* =========================
   📁 PROYECTOS
========================= */
app.get("/proyectos", (req, res) => {
 db.query("SELECT * FROM proyectos", (err, r) => {
  res.json(r);
 });
});

app.post("/proyectos", (req, res) => {
 db.query(
  "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
  [req.body.numero, req.body.sitio],
  () => res.sendStatus(200)
 );
});

/* =========================
   📝 INFORMES
========================= */
const storage = multer.diskStorage({
 destination: "uploads/",
 filename: (req, file, cb) => {
  cb(null, Date.now() + "-" + file.originalname);
 }
});

const upload = multer({ storage });

app.post("/informes", upload.array("fotos"), (req, res) => {
 const { proyecto, sitio, fecha, descripcion } = req.body;

 db.query(
  "INSERT INTO informes(proyecto,sitio,fecha,descripcion) VALUES (?,?,?,?)",
  [proyecto, sitio, fecha, descripcion],
  () => res.sendStatus(200)
 );
});

app.get("/informes", (req, res) => {
 db.query("SELECT * FROM informes ORDER BY id DESC", (err, r) => {
  res.json(r);
 });
});

app.delete("/informes/:id", (req, res) => {
 db.query(
  "DELETE FROM informes WHERE id=?",
  [req.params.id],
  () => res.sendStatus(200)
 );
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("🚀 SaaS running on port " + PORT);
});
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();

/* =========================
   🔐 CORS PRODUCCIÓN
========================= */
app.use(cors({
 origin: "*",
 methods: ["GET","POST","DELETE"]
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   🔌 MYSQL
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
   🔐 LOGIN (ARREGLADO)
========================= */
app.post("/login", (req, res) => {

 const { user, pass } = req.body;

 db.query(
  "SELECT * FROM usuarios WHERE user=? AND pass=?",
  [user, pass],
  (err, result) => {

   if (err) return res.status(500).json({ error: "DB error" });
   if (result.length === 0) return res.status(401).json({ error: "Login incorrecto" });

   const usuario = result[0];

   // 🔥 TOKEN REAL
   const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    "secret_key",
    { expiresIn: "8h" }
   );

   res.json({
    token,
    role: usuario.role,
    user: usuario.user
   });

  }
 );

});

/* =========================
   🔐 MIDDLEWARE TOKEN
========================= */
function verifyToken(req, res, next) {
 const auth = req.headers["authorization"];

 if (!auth) return res.status(403).send("No token");

 const token = auth.split(" ")[1];

 jwt.verify(token, "secret_key", (err, decoded) => {
  if (err) return res.status(403).send("Token inválido");

  req.user = decoded;
  next();
 });
}

/* =========================
   👷 TECNICOS
========================= */
app.get("/tecnicos", verifyToken, (req, res) => {
 db.query("SELECT * FROM tecnicos", (err, r) => res.json(r));
});

app.post("/tecnicos", verifyToken, (req, res) => {
 db.query("INSERT INTO tecnicos(nombre) VALUES(?)", [req.body.nombre],
  () => res.sendStatus(200)
 );
});

app.delete("/tecnicos/:id", verifyToken, (req, res) => {
 db.query("DELETE FROM tecnicos WHERE id=?", [req.params.id],
  () => res.sendStatus(200)
 );
});

/* =========================
   📁 PROYECTOS
========================= */
app.get("/proyectos", verifyToken, (req, res) => {
 db.query("SELECT * FROM proyectos", (err, r) => res.json(r));
});

app.post("/proyectos", verifyToken, (req, res) => {
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

app.post("/informes", verifyToken, upload.array("fotos"), (req, res) => {

 const { proyecto, sitio, fecha, descripcion } = req.body;

 db.query(
  "INSERT INTO informes(proyecto,sitio,fecha,descripcion) VALUES (?,?,?,?)",
  [proyecto, sitio, fecha, descripcion],
  () => res.sendStatus(200)
 );

});

app.get("/informes", verifyToken, (req, res) => {
 db.query("SELECT * FROM informes ORDER BY id DESC", (err, r) => res.json(r));
});

app.delete("/informes/:id", verifyToken, (req, res) => {
 db.query("DELETE FROM informes WHERE id=?", [req.params.id],
  () => res.sendStatus(200)
 );
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("🚀 API running on " + PORT);
});
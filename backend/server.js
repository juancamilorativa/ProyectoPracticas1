const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* MULTER */
const storage = multer.diskStorage({
 destination: "uploads/",
 filename: (req,file,cb)=> cb(null, Date.now()+"-"+file.originalname)
});
const upload = multer({ storage });

/* MYSQL */
const db = mysql.createConnection({
 host:"localhost",
 user:"root",
 password:"1234",
 database:"sistema_pro"
});
db.connect(()=>console.log("MySQL conectado"));

/* LOGIN */
app.post("/login",(req,res)=>{
 const {user,pass}=req.body;
 db.query("SELECT * FROM usuarios WHERE user=? AND pass=?",[user,pass],
 (err,r)=>{
  if(err) return res.status(500).send("Error");
  if(r.length===0) return res.status(401).send("Credenciales incorrectas");
  res.json(r[0]);
 });
});

/* TECNICOS */
app.get("/tecnicos",(req,res)=>{
 db.query("SELECT * FROM tecnicos",(e,r)=>res.json(r));
});
app.post("/tecnicos",(req,res)=>{
 db.query("INSERT INTO tecnicos(nombre) VALUES(?)",[req.body.nombre],()=>res.send("OK"));
});
app.put("/tecnicos/:id",(req,res)=>{
 db.query("UPDATE tecnicos SET nombre=? WHERE id=?",[req.body.nombre,req.params.id],()=>res.send("OK"));
});
app.delete("/tecnicos/:id",(req,res)=>{
 db.query("DELETE FROM tecnicos WHERE id=?",[req.params.id],()=>res.send("OK"));
});

/* PROYECTOS */
app.get("/proyectos",(req,res)=>{
 db.query("SELECT * FROM proyectos",(e,r)=>res.json(r));
});
app.post("/proyectos",(req,res)=>{
 db.query("INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
 [req.body.numero,req.body.sitio],()=>res.send("OK"));
});
app.put("/proyectos/:id",(req,res)=>{
 db.query("UPDATE proyectos SET numero=?,sitio=? WHERE id=?",
 [req.body.numero,req.body.sitio,req.params.id],()=>res.send("OK"));
});
app.delete("/proyectos/:id",(req,res)=>{
 db.query("DELETE FROM proyectos WHERE id=?",[req.params.id],()=>res.send("OK"));
});

/* INFORMES */
app.post("/informes", upload.array("fotos"), (req,res)=>{
 const { sitio, proyecto, fecha, descripcion } = req.body;
 const personas = JSON.parse(req.body.personas || "[]");
 const fotos = (req.files||[]).map(f=>"/uploads/"+f.filename);

 db.query(
 "INSERT INTO informes(sitio,proyecto,fecha,descripcion,personas,fotos) VALUES (?,?,?,?,?,?)",
 [sitio,proyecto,fecha,descripcion,JSON.stringify(personas),JSON.stringify(fotos)],
 ()=>res.send("OK"));
});

app.get("/informes",(req,res)=>{
 db.query("SELECT * FROM informes ORDER BY id DESC",(e,r)=>{
  res.json(r.map(x=>({
   ...x,
   personas: JSON.parse(x.personas||"[]"),
   fotos: JSON.parse(x.fotos||"[]")
  })));
 });
});

app.put("/informes/:id",(req,res)=>{
 db.query("UPDATE informes SET fecha=?,descripcion=? WHERE id=?",
 [req.body.fecha, req.body.descripcion, req.params.id],
 ()=>res.send("OK"));
});

app.delete("/informes/:id",(req,res)=>{
 db.query("DELETE FROM informes WHERE id=?",[req.params.id],()=>res.send("OK"));
});

app.listen(3000,()=>console.log("Servidor http://localhost:3000"));
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

/* MYSQL */
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

/* RESPUESTAS */
const ok = (res, data={}) => res.json({ ok:true, data });
const fail = (res, msg="Error", code=500)=>res.status(code).json({ok:false,error:msg});

/* LOGIN */
app.post("/login",(req,res)=>{
 const {user,pass}=req.body;

 db.query("SELECT * FROM usuarios WHERE user=? AND pass=?",[user,pass],(err,r)=>{
  if(err) return fail(res,err.message);
  if(!r.length) return fail(res,"Login incorrecto",401);

  const token=jwt.sign({id:r[0].id,role:r[0].role},process.env.JWT_SECRET,{expiresIn:"8h"});
  ok(res,{token,role:r[0].role});
 });
});

/* TOKEN */
function verifyToken(req,res,next){
 const auth=req.headers["authorization"];
 if(!auth) return fail(res,"No token",403);

 const token=auth.split(" ")[1];
 jwt.verify(token,process.env.JWT_SECRET,(err,dec)=>{
  if(err) return fail(res,"Token inválido",403);
  req.user=dec;
  next();
 });
}

/* ADMIN */
function soloAdmin(req,res,next){
 if(req.user.role!=="admin") return fail(res,"No autorizado",403);
 next();
}

/* TECNICOS */
app.get("/tecnicos",verifyToken,(req,res)=>{
 db.query("SELECT * FROM tecnicos",(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,r);
 });
});

app.post("/tecnicos",verifyToken,soloAdmin,(req,res)=>{
 db.query("INSERT INTO tecnicos(nombre) VALUES(?)",[req.body.nombre],(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,{id:r.insertId});
 });
});

/* PROYECTOS */
app.get("/proyectos",verifyToken,(req,res)=>{
 db.query("SELECT * FROM proyectos",(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,r);
 });
});

app.post("/proyectos",verifyToken,soloAdmin,(req,res)=>{
 db.query("INSERT INTO proyectos(numero,sitio) VALUES(?,?)",[req.body.numero,req.body.sitio],(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,{id:r.insertId});
 });
});

/* MULTER */
const storage=multer.diskStorage({
 destination:"uploads/",
 filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});
const upload=multer({storage});

/* INFORMES */
app.get("/informes",verifyToken,(req,res)=>{
 db.query("SELECT * FROM informes ORDER BY id DESC",(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,r);
 });
});

app.post("/informes",verifyToken,upload.array("fotos"),(req,res)=>{
 const {proyecto,sitio,fecha,descripcion,personas}=req.body;
 const fotos=req.files?.map(f=>f.filename).join(",")||"";

 db.query("INSERT INTO informes(proyecto,sitio,fecha,descripcion,personas,fotos) VALUES (?,?,?,?,?,?)",
 [proyecto,sitio,fecha,descripcion,personas,fotos],
 (e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,{id:r.insertId});
 });
});

app.put("/informes/:id",verifyToken,(req,res)=>{
 db.query("UPDATE informes SET fecha=?,descripcion=? WHERE id=?",
 [req.body.fecha,req.body.descripcion,req.params.id],
 (e)=>{if(e) return fail(res,e.message); ok(res);});
});

app.delete("/informes/:id",verifyToken,(req,res)=>{
 db.query("DELETE FROM informes WHERE id=?",[req.params.id],
 (e)=>{if(e) return fail(res,e.message); ok(res);});
});

app.listen(process.env.PORT||3000,()=>console.log("🚀 API running"));
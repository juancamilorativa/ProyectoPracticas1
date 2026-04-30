require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================== MYSQL ================== */
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

/* ================== RESP ================== */
const ok = (res,data=[])=>res.json({ok:true,data});
const fail = (res,msg,code=500)=>res.status(code).json({ok:false,error:msg});

/* ================== REGISTER ================== */
app.post("/register", async (req,res)=>{
 const {user,pass,role} = req.body;

 if(!user || !pass) return fail(res,"Faltan datos",400);

 try{
  const hash = await bcrypt.hash(pass,10);

  db.query(
   "INSERT INTO usuarios(user, pass, role) VALUES (?,?,?)",
   [user,hash,role || "user"],
   (err)=>{
    if(err) return fail(res,err.message);
    ok(res,"Usuario creado");
   }
  );
 }catch(e){
  fail(res,e.message);
 }
});

/* ================== LOGIN ================== */
app.post("/login",(req,res)=>{
 const {user,pass}=req.body;

 db.query("SELECT * FROM usuarios WHERE user=?",[user], async (err,r)=>{
  if(err) return fail(res,err.message);
  if(!r.length) return fail(res,"Login incorrecto",401);

  const usuario = r[0];

  const passwordCorrecta = await bcrypt.compare(pass, usuario.pass);

  if(!passwordCorrecta){
   return fail(res,"Login incorrecto",401);
  }

  const token = jwt.sign(
   {id:usuario.id,role:usuario.role},
   process.env.JWT_SECRET,
   {expiresIn:"8h"}
  );

  ok(res,{token,role:usuario.role});
 });
});

/* ================== TOKEN ================== */
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

function soloAdmin(req,res,next){
 if(req.user.role!=="admin") return fail(res,"No autorizado",403);
 next();
}

app.get("/usuarios", verifyToken, soloAdmin, (req,res)=>{
 db.query("SELECT id, user, role FROM usuarios",(err,r)=>{
  if(err) return fail(res,err.message);
  ok(res,r);
 });
});

/* ================== TECNICOS ================== */
app.get("/tecnicos",verifyToken,(req,res)=>{
 db.query("SELECT * FROM tecnicos",(e,r)=>ok(res,r));
});

app.post("/tecnicos",verifyToken,soloAdmin,(req,res)=>{
 const {nombre}=req.body;

 db.query("SELECT * FROM tecnicos WHERE nombre=?",[nombre],(e,r)=>{
  if(r.length>0) return fail(res,"Ya existe",400);

  db.query("INSERT INTO tecnicos(nombre) VALUES(?)",[nombre],()=>ok(res));
 });
});

app.delete("/tecnicos/:id",verifyToken,soloAdmin,(req,res)=>{
 db.query("DELETE FROM tecnicos WHERE id=?",[req.params.id],()=>ok(res));
});

/* ================== PROYECTOS ================== */
app.get("/proyectos",verifyToken,(req,res)=>{
 db.query("SELECT * FROM proyectos",(e,r)=>ok(res,r));
});

app.post("/proyectos",verifyToken,soloAdmin,(req,res)=>{
 const {numero,sitio}=req.body;

 db.query("SELECT * FROM proyectos WHERE numero=?",[numero],(e,r)=>{
  if(r.length>0) return fail(res,"Proyecto ya existe",400);

  db.query(
   "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
   [numero,sitio],
   ()=>ok(res)
  );
 });
});

app.delete("/proyectos/:id",verifyToken,soloAdmin,(req,res)=>{
 db.query("DELETE FROM proyectos WHERE id=?",[req.params.id],()=>ok(res));
});

/* ================== MULTER ================== */
const storage = multer.diskStorage({
 destination:"uploads/",
 filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});
const upload = multer({storage});

/* ================== INFORMES ================== */
app.post("/informes",verifyToken,upload.array("fotos"),(req,res)=>{

 const {proyecto,sitio,descripcion}=req.body;
 const fecha = new Date();
 const fotos = req.files?.map(f=>f.filename).join(",") || "";

 db.query(
  "INSERT INTO informes(proyecto,sitio,fecha,descripcion,fotos) VALUES (?,?,?,?,?)",
  [proyecto,sitio,fecha,descripcion,fotos],
  (err,result)=>{

   if(err) return fail(res,err.message);

   const informeId = result.insertId;

   let personas = [];
   try{
    personas = JSON.parse(req.body.personas || "[]");
   }catch{
    personas = [];
   }

   if(personas.length === 0) return ok(res);

   const values = personas.map(p=>[informeId,p]);

   db.query(
    "INSERT INTO informe_tecnicos (informe_id, tecnico_id) VALUES ?",
    [values],
    ()=>ok(res)
   );
  }
 );
});

app.get("/informes",verifyToken,(req,res)=>{

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

 db.query(sql,(err,r)=>{
  if(err) return fail(res,err.message);
  ok(res,r);
 });
});

app.put("/informes/:id",verifyToken,(req,res)=>{
 db.query(
  "UPDATE informes SET descripcion=? WHERE id=?",
  [req.body.descripcion,req.params.id],
  ()=>ok(res)
 );
});

app.delete("/informes/:id",verifyToken,soloAdmin,(req,res)=>{
 db.query("DELETE FROM informes WHERE id=?",[req.params.id],()=>ok(res));
});

/* ================== SERVER ================== */
app.listen(process.env.PORT||3000,()=>{
 console.log("🚀 API running");
});
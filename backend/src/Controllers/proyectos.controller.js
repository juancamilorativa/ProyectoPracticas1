const db = require("../config/db");
const { ok, fail } = require("../utils/response");

function validarCampos(obj, campos){
 for(let campo of campos){
  if(!obj[campo] || obj[campo].toString().trim()===""){
   return campo;
  }
 }
 return null;
}

exports.getProyectos = (req,res)=>{
 db.query("SELECT * FROM proyectos",(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,r);
 });
};

exports.createProyecto = (req,res)=>{
 const campoFaltante = validarCampos(req.body,["numero","sitio"]);
 if(campoFaltante) return fail(res,`Falta ${campoFaltante}`,400);

 const {numero,sitio}=req.body;

 db.query("SELECT * FROM proyectos WHERE numero=?",[numero],(e,r)=>{
  if(e) return fail(res,e.message);
  if(r.length>0) return fail(res,"Proyecto ya existe",400);

  db.query(
   "INSERT INTO proyectos(numero,sitio) VALUES(?,?)",
   [numero,sitio],
   (err)=>{
    if(err) return fail(res,err.message);
    ok(res);
   }
  );
 });
};

exports.deleteProyecto = (req,res)=>{
 db.query("DELETE FROM proyectos WHERE id=?",[req.params.id],(e)=>{
  if(e) return fail(res,e.message);
  ok(res);
 });
};
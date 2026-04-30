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

exports.getTecnicos = (req,res)=>{
 db.query("SELECT * FROM tecnicos",(e,r)=>{
  if(e) return fail(res,e.message);
  ok(res,r);
 });
};

exports.createTecnico = (req,res)=>{
 const campoFaltante = validarCampos(req.body,["nombre"]);
 if(campoFaltante) return fail(res,`Falta ${campoFaltante}`,400);

 const {nombre}=req.body;

 db.query("SELECT * FROM tecnicos WHERE nombre=?",[nombre],(e,r)=>{
  if(e) return fail(res,e.message);
  if(r.length>0) return fail(res,"Ya existe",400);

  db.query("INSERT INTO tecnicos(nombre) VALUES(?)",[nombre],(err)=>{
   if(err) return fail(res,err.message);
   ok(res);
  });
 });
};

exports.deleteTecnico = (req,res)=>{
 db.query("DELETE FROM tecnicos WHERE id=?",[req.params.id],(e)=>{
  if(e) return fail(res,e.message);
  ok(res);
 });
};
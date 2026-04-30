const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ok, fail } = require("../utils/response");

function validarCampos(obj, campos){
 for(let campo of campos){
  if(!obj[campo] || obj[campo].toString().trim()===""){
   return campo;
  }
 }
 return null;
}

exports.login = (req,res)=>{

 const campoFaltante = validarCampos(req.body,["user","pass"]);
 if(campoFaltante) return fail(res,`Falta ${campoFaltante}`,400);

 const {user,pass}=req.body;

 db.query("SELECT * FROM usuarios WHERE user=?",[user],async (err,r)=>{
  if(err) return fail(res,err.message);
  if(!r.length) return fail(res,"Login incorrecto",401);

  const valid = await bcrypt.compare(pass, r[0].pass);
  if(!valid) return fail(res,"Login incorrecto",401);

  const token = jwt.sign(
   {id:r[0].id,role:r[0].role},
   process.env.JWT_SECRET,
   {expiresIn:"8h"}
  );

  ok(res,{token,role:r[0].role});
 });
};
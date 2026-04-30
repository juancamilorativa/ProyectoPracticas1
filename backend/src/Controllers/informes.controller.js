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

exports.createInforme = (req,res)=>{

 const campoFaltante = validarCampos(req.body,["proyecto","sitio","descripcion"]);
 if(campoFaltante) return fail(res,`Falta ${campoFaltante}`,400);

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
    (e)=>{
     if(e) return fail(res,e.message);
     ok(res);
    }
   );
  }
 );
};

exports.getInformes = (req,res)=>{

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
};

exports.updateInforme = (req,res)=>{

 if(!req.body.descripcion)
  return fail(res,"Falta descripcion",400);

 db.query(
  "UPDATE informes SET descripcion=? WHERE id=?",
  [req.body.descripcion,req.params.id],
  (e)=>{
   if(e) return fail(res,e.message);
   ok(res);
  }
 );
};

exports.deleteInforme = (req,res)=>{
 db.query("DELETE FROM informes WHERE id=?",[req.params.id],(e)=>{
  if(e) return fail(res,e.message);
  ok(res);
 });
};
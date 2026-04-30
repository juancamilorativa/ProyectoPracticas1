const jwt = require("jsonwebtoken");
const { fail } = require("../utils/response");

function verifyToken(req,res,next){
 const auth = req.headers.authorization;

 if(!auth || !auth.startsWith("Bearer "))
  return fail(res,"Token requerido",403);

 const token = auth.split(" ")[1];

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

module.exports = { verifyToken, soloAdmin };
const ok = (res,data=[])=>res.json({ok:true,data});
const fail = (res,msg,code=500)=>res.status(code).json({ok:false,error:msg});

module.exports = { ok, fail };
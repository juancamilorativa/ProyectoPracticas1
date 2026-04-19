let rolActual = "";
let editId = null;

/* LOGIN */
function login(){

 fetch("http://localhost:3000/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   user: document.getElementById("user").value,
   pass: document.getElementById("pass").value
  })
 })
 .then(res=>{
  if(!res.ok) throw new Error("Credenciales incorrectas");
  return res.json();
 })
 .then(u=>{

  document.getElementById("login").classList.add("hidden");

  if(u.rol==="admin"){
   document.getElementById("panelAdmin").classList.remove("hidden");
  }else{
   document.getElementById("panelTecnico").classList.remove("hidden");
   cargarProyectos();
   cargarTecnicos();
   mostrarInformes();
  }

 })
 .catch(()=>alert("Usuario o contraseña incorrectos"));
}

/* ADMIN */
function mostrarSeccion(s){
 tecnicosSec.classList.add("hidden");
 proyectosSec.classList.add("hidden");
 informesSec.classList.add("hidden");

 if(s==="tecnicos"){tecnicosSec.classList.remove("hidden");mostrarTecnicos();}
 if(s==="proyectos"){proyectosSec.classList.remove("hidden");mostrarProyectos();}
 if(s==="informes"){informesSec.classList.remove("hidden");mostrarInformesAdmin();}
}

/* TECNICOS */
function mostrarTecnicos(){
 fetch("http://localhost:3000/tecnicos")
 .then(r=>r.json())
 .then(d=>{
  listaTecnicos.innerHTML="";
  d.forEach(t=>{
   listaTecnicos.innerHTML+=`${t.nombre}
   <button onclick="eliminarTecnico(${t.id})">X</button><br>`;
  });
 });
}

function agregarTecnico(){
 fetch("http://localhost:3000/tecnicos",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({nombre:nuevoTecnico.value})
 }).then(mostrarTecnicos);
}

/* PROYECTOS */
function mostrarProyectos(){
 fetch("http://localhost:3000/proyectos")
 .then(r=>r.json())
 .then(d=>{
  listaProyectos.innerHTML="";
  d.forEach(p=>{
   listaProyectos.innerHTML+=`${p.numero}-${p.sitio}<br>`;
  });
 });
}

function agregarProyecto(){
 fetch("http://localhost:3000/proyectos",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({numero:numeroProyecto.value,sitio:nombreSitio.value})
 }).then(mostrarProyectos);
}

/* CARGAS */
function cargarProyectos(){
 fetch("http://localhost:3000/proyectos")
 .then(r=>r.json())
 .then(d=>{
  proyecto.innerHTML="";
  d.forEach(p=>proyecto.innerHTML+=`<option>${p.numero}</option>`);
 });
}

function cargarTecnicos(){
 fetch("http://localhost:3000/tecnicos")
 .then(r=>r.json())
 .then(d=>{
  personas.innerHTML="";
  d.forEach(t=>personas.innerHTML+=`<option>${t.nombre}</option>`);
 });
}

/* INFORMES */
function guardarInforme(){
 let fd=new FormData();
 fd.append("proyecto",proyecto.value);
 fd.append("sitio",sitio.value);
 fd.append("fecha",fecha.value);
 fd.append("descripcion",descripcion.value);
 fd.append("personas",JSON.stringify([...personas.selectedOptions].map(o=>o.value)));

 for(let f of fotos.files) fd.append("fotos",f);

 fetch("http://localhost:3000/informes",{method:"POST",body:fd})
 .then(mostrarInformes);
}

function mostrarInformes(){
 fetch("http://localhost:3000/informes")
 .then(r=>r.json())
 .then(d=>{
  listaInformes.innerHTML="";
  d.forEach(i=>{
   listaInformes.innerHTML+=`${i.sitio} - ${i.fecha}<br>`;
  });
 });
}

function mostrarInformesAdmin(){
 fetch("http://localhost:3000/informes")
 .then(r=>r.json())
 .then(d=>{
  informesSec.innerHTML="";
  d.forEach(i=>{
   informesSec.innerHTML+=`
   ${i.sitio}
   <button onclick="eliminarInforme(${i.id})">X</button><br>`;
  });
 });
}

function eliminarInforme(id){
 fetch(`http://localhost:3000/informes/${id}`,{method:"DELETE"})
 .then(mostrarInformesAdmin);
}

function logout(){location.reload();}
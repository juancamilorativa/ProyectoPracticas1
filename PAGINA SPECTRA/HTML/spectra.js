let token = null;

/* =========================
   LOGIN SAAS (JWT)
========================= */
function login() {

 fetch("https://TU-BACKEND.onrender.com/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   user: user.value,
   pass: pass.value
  })
 })
 .then(r => {
  if (!r.ok) throw new Error("Login incorrecto");
  return r.json();
 })
 .then(data => {

  token = data.token;

  loginDiv.classList.add("hidden");

  if (data.role === "admin") {
   panelAdmin.classList.remove("hidden");
   mostrarSeccion("tecnicos");
  } else {
   panelTecnico.classList.remove("hidden");
   cargarProyectos();
   cargarTecnicos();
   mostrarInformes();
  }

 });
}

/* =========================
   HEADERS SAAS
========================= */
function authHeader(){
 return {
  "Authorization": "Bearer " + token
 };
}

/* =========================
   ADMIN SECCIONES
========================= */
function mostrarSeccion(s){

 tecnicosSec.classList.add("hidden");
 proyectosSec.classList.add("hidden");
 informesSec.classList.add("hidden");

 if (s === "tecnicos") {
  tecnicosSec.classList.remove("hidden");
  mostrarTecnicos();
 }

 if (s === "proyectos") {
  proyectosSec.classList.remove("hidden");
  mostrarProyectos();
 }

 if (s === "informes") {
  informesSec.classList.remove("hidden");
  mostrarInformesAdmin();
 }

}

/* =========================
   TECNICOS SAAS
========================= */
function mostrarTecnicos(){
 fetch("https://TU-BACKEND.onrender.com/tecnicos", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  listaTecnicos.innerHTML = "";
  d.forEach(t => {
   listaTecnicos.innerHTML += `
   <div>
    ${t.nombre}
    <button onclick="eliminarTecnico(${t.id})">X</button>
   </div>`;
  });
 });
}

function agregarTecnico(){
 fetch("https://TU-BACKEND.onrender.com/tecnicos", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
   ...authHeader()
  },
  body: JSON.stringify({
   nombre: nuevoTecnico.value
  })
 }).then(mostrarTecnicos);
}

/* =========================
   PROYECTOS SAAS
========================= */
function mostrarProyectos(){
 fetch("https://TU-BACKEND.onrender.com/proyectos", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  listaProyectos.innerHTML = "";
  d.forEach(p => {
   listaProyectos.innerHTML += `
   <div>${p.numero} - ${p.sitio}</div>`;
  });
 });
}

function agregarProyecto(){
 fetch("https://TU-BACKEND.onrender.com/proyectos", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
   ...authHeader()
  },
  body: JSON.stringify({
   numero: numeroProyecto.value,
   sitio: nombreSitio.value
  })
 }).then(mostrarProyectos);
}

/* =========================
   CARGAS TECNICO
========================= */
function cargarProyectos(){
 fetch("https://TU-BACKEND.onrender.com/proyectos", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  proyecto.innerHTML = "";
  d.forEach(p => {
   proyecto.innerHTML += `<option>${p.numero}</option>`;
  });
 });
}

function cargarTecnicos(){
 fetch("https://TU-BACKEND.onrender.com/tecnicos", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  personas.innerHTML = "";
  d.forEach(t => {
   personas.innerHTML += `<option>${t.nombre}</option>`;
  });
 });
}

/* =========================
   INFORMES SAAS (UPLOAD REAL)
========================= */
function guardarInforme(){

 let fd = new FormData();

 fd.append("proyecto", proyecto.value);
 fd.append("sitio", sitio.value);
 fd.append("fecha", fecha.value);
 fd.append("descripcion", descripcion.value);
 fd.append("personas", JSON.stringify([...personas.selectedOptions].map(o => o.value)));

 for (let f of fotos.files) {
  fd.append("fotos", f);
 }

 fetch("https://TU-BACKEND.onrender.com/informes", {
  method: "POST",
  headers: {
   "Authorization": "Bearer " + token
  },
  body: fd
 })
 .then(mostrarInformes);
}

/* =========================
   LISTAR INFORMES
========================= */
function mostrarInformes(){
 fetch("https://TU-BACKEND.onrender.com/informes", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  listaInformes.innerHTML = "";
  d.forEach(i => {
   listaInformes.innerHTML += `
   <div>
    ${i.sitio} - ${i.fecha}
   </div>`;
  });
 });
}

function mostrarInformesAdmin(){
 fetch("https://TU-BACKEND.onrender.com/informes", {
  headers: authHeader()
 })
 .then(r => r.json())
 .then(d => {
  informesSec.innerHTML = "";
  d.forEach(i => {
   informesSec.innerHTML += `
   <div>
    ${i.sitio}
    <button onclick="eliminarInforme(${i.id})">X</button>
   </div>`;
  });
 });
}

/* =========================
   DELETE
========================= */
function eliminarInforme(id){
 fetch("https://TU-BACKEND.onrender.com/informes/" + id, {
  method: "DELETE",
  headers: authHeader()
 }).then(mostrarInformesAdmin);
}

/* LOGOUT */
function logout(){
 localStorage.removeItem("token");
 location.reload();
}
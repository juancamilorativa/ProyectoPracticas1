require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const path = require("path");

/* RUTAS */
const authRoutes = require("./routes/authRoutes");

const informesRoutes = require("./routes/informesRoutes");

const proyectosRoutes = require("./routes/proyectosRoutes");

const tecnicosRoutes = require("./routes/tecnicosRoutes");

const app = express();

/* MIDDLEWARES */
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* CARPETA PUBLICA PARA ARCHIVOS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* CONEXION MONGO ATLAS */
mongoose.connect(process.env.MONGO_URI)

  .then(() => {

    console.log("✅ Mongo Atlas conectado");

  })

  .catch((error) => {

    console.log("❌ Error MongoDB:", error);

  });

/* RUTAS API */
app.use("/auth", authRoutes);

app.use("/informes", informesRoutes);

app.use("/proyectos", proyectosRoutes);

app.use("/tecnicos", tecnicosRoutes);

/* RUTA PRINCIPAL */
app.get("/", (req, res) => {

  res.send("API running");

});

/* PUERTO */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);

});
app.get("/test", (req, res) => {
  console.log("🔥 TEST LLEGÓ");
  res.send("OK");
});
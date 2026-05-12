require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const informesRoutes = require("./routes/informesRoutes");
const proyectosRoutes = require("./routes/proyectosRoutes");
const tecnicosRoutes = require("./routes/tecnicosRoutes");

const app = express();

/* MIDDLEWARES */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ARCHIVOS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* RUTAS */
app.use("/auth", authRoutes);
app.use("/informes", informesRoutes);
app.use("/proyectos", proyectosRoutes);
app.use("/tecnicos", tecnicosRoutes);

/* TEST */
app.get("/test", (req, res) => {
  res.send("OK");
});

/* PUERTO */
const PORT = process.env.PORT || 3000;

/* INICIAR SERVIDOR SOLO CUANDO MONGO CONECTE */
async function startServer() {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Mongo Atlas conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });

  } catch (error) {

    console.log("❌ Error MongoDB:", error);

  }
}

startServer();
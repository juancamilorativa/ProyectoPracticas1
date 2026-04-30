require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
 origin: ["http://localhost:5173","http://localhost:3000"]
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// RUTAS
app.use("/api", require("./routes/auth.routes"));
app.use("/api/tecnicos", require("./routes/tecnicos.routes"));
app.use("/api/proyectos", require("./routes/proyectos.routes"));
app.use("/api/informes", require("./routes/informes.routes"));

app.listen(process.env.PORT||3000,()=>{
 console.log("🚀 API running");
});
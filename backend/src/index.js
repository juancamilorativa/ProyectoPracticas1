require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/", require("./routes/authRoutes"));
app.use("/tecnicos", require("./routes/tecnicosRoutes"));
app.use("/proyectos", require("./routes/proyectosRoutes"));
app.use("/informes", require("./routes/informesRoutes"));

app.get("/", (req, res) => {
  res.send(" API funcionando");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(" API running");
});
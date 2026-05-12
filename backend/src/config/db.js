const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Mongo Atlas conectado");
  } catch (error) {
    console.log("❌ Error Mongo:", error);
    process.exit(1);
  }
};

module.exports = conectarDB;
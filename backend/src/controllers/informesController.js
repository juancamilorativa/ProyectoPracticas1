const Informe = require("../models/Informe");

/* CREAR INFORME */
exports.crearInforme = async (req, res) => {

  try {

    const {

      proyecto,
      sitio,
      descripcion,
      fecha, 
      personas

    } = req.body;

    let fotos = [];

    let videos = [];

    /* ARCHIVOS */
    if (req.files) {

      req.files.forEach(file => {

        if (file.mimetype.startsWith("image")) {

          fotos.push(file.filename);

        }

        if (file.mimetype.startsWith("video")) {

          videos.push(file.filename);

        }

      });

    }

    const nuevoInforme = new Informe({

      proyecto,
      sitio,
      descripcion,
      fecha: fecha || new Date(),
      personas: JSON.parse(personas || "[]"),

     
      fotos,
      videos

    });

    await nuevoInforme.save();

    res.json({

      ok: true,

      mensaje: "Informe creado",

      data: nuevoInforme

    });

  } catch (error) {

    console.log("🔥 ERROR INFORME:", error);


    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};
/* OBTENER INFORMES */
exports.obtenerInformes = async (req, res) => {

  try {

    const Tecnico = require("../models/Tecnico");

    const informes = await Informe.find();

    const nuevosInformes = [];

    for (let informe of informes) {

      let responsables = "";

      if (
  informe.personas &&
  Array.isArray(informe.personas) &&
  informe.personas.length > 0
) {

  const tecnicos = await Tecnico.find();

  const filtrados = tecnicos.filter(t =>
    informe.personas.includes(t._id.toString())
  );

  responsables = filtrados
    .map(t => t.nombre)
    .join(", ");
}
      nuevosInformes.push({
        ...informe._doc,
        responsables
      });
    }

    res.json({
      ok: true,
      data: nuevosInformes
    });

  } catch (error) {

    console.log("🔥 ERROR OBTENER:", error);

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};
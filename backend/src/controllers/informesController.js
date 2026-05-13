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

    for (let informe of informes) {

      let nombres = [];

      if (informe.personas && informe.personas.length > 0) {

        const tecnicos = await Tecnico.find({
          _id: { $in: informe.personas }
        });

        nombres = tecnicos.map(t => t.nombre);

      }

      informe._doc.responsables = nombres.join(", ");
    }

    res.json({

      ok: true,

      data: informes

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};
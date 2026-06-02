const Informe = require("../models/Informe");

/* CREAR INFORME */
exports.crearInforme = async (req, res) => {

  try {

    const {

      proyecto,
      sitio,
      descripcion,
      fechaEjecucion,
      personas

    } = req.body;

    /* VALIDAR CAMPOS */
    if (
      !proyecto ||
      !sitio ||
      !descripcion ||
      !personas
    ) {

      return res.status(400).json({

        ok: false,

        error: "Todos los campos son obligatorios"

      });

    }

    /* VALIDAR ARCHIVOS */
    if (!req.files || req.files.length === 0) {

      return res.status(400).json({

        ok: false,

        error: "Debes cargar mínimo una imagen"

      });

    }

    let fotos = [];

    let videos = [];

    /* ARCHIVOS */
    req.files.forEach(file => {

      if (file.mimetype.startsWith("image")) {

        fotos.push(file.filename);

      }

      if (file.mimetype.startsWith("video")) {

        videos.push(file.filename);

      }

    });

    /* VALIDAR QUE HAYA AL MENOS UNA FOTO */
    if (fotos.length === 0) {

      return res.status(400).json({

        ok: false,

        error: "Debes subir mínimo una imagen"

      });

    }

    const nuevoInforme = new Informe({

      proyecto,

      sitio,

      descripcion,

      // FECHA DE EJECUCIÓN
      fechaEjecucion: fecha,

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

/* EDITAR INFORME */
exports.editarInforme = async (req, res) => {

  try {

    const { id } = req.params;

    const { fecha, descripcion } = req.body;

    const informeActualizado =
      await Informe.findByIdAndUpdate(

        id,

        {
          fecha,
          descripcion
        },

        { new: true }

      );

    res.json({

      ok: true,
      data: informeActualizado

    });

  } catch (error) {

    res.status(500).json({

      ok: false,
      error: error.message

    });

  }

};

/* ELIMINAR INFORME */
exports.eliminarInforme = async (req, res) => {

  try {

    const { id } = req.params;

    await Informe.findByIdAndDelete(id);

    res.json({
      ok: true,
      mensaje: "Informe eliminado"
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};
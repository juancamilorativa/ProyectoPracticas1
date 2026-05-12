const Tecnico = require("../models/Tecnico");


/* LISTAR */
exports.getTecnicos = async (req, res) => {

  try {

    const tecnicos = await Tecnico.find()
      .sort({ nombre: 1 });

    res.json({

      ok: true,

      data: tecnicos

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};


/* CREAR */
exports.addTecnico = async (req, res) => {

  try {

    const { nombre } = req.body;

    if (!nombre) {

      return res.status(400).json({

        ok: false,

        error: "El nombre es obligatorio"

      });

    }

    /* VALIDAR EXISTE */
    const existe = await Tecnico.findOne({ nombre });

    if (existe) {

      return res.status(400).json({

        ok: false,

        error: "Ya existe"

      });

    }

    /* CREAR */
    const nuevoTecnico = new Tecnico({

      nombre

    });

    await nuevoTecnico.save();

    res.json({

      ok: true,

      data: nuevoTecnico

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};


/* ELIMINAR */
exports.deleteTecnico = async (req, res) => {

  try {

    const { id } = req.params;

    await Tecnico.findByIdAndDelete(id);

    res.json({

      ok: true,

      mensaje: "Técnico eliminado"

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

};
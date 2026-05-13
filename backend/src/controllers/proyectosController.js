const Proyecto = require("../models/Proyecto");

/* LISTAR */
exports.getProyectos = async (req, res) => {

  try {

    const proyectos = await Proyecto.find()
      .sort({ _id: -1 });

    res.json({
      ok: true,
      data: proyectos
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* CREAR */
exports.addProyecto = async (req, res) => {

  try {

    const { numero, sitio } = req.body;

     if (!numero || !sitio) {

      return res.status(400).json({
        ok: false,
        mensaje: "El nombre es obligatorio"
      });

    }

    const nuevoProyecto = new Proyecto({
    numero,
  sitio
   });

    await nuevoProyecto.save();

    res.json({
      ok: true,
      mensaje: "Proyecto agregado",
      data: nuevoProyecto
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};

/* ELIMINAR */
exports.deleteProyecto = async (req, res) => {

  try {

    const { id } = req.params;

    await Proyecto.findByIdAndDelete(id);

    res.json({
      ok: true,
      mensaje: "Proyecto eliminado"
    });

  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

};
const Obra = require('../models/Obra');

const crearObra = async (req, res) => {
    try {
        const { titulo, tituloEn, descripcion, serie, precio, categoria, imagenPortada, imagenes, enVenta } = req.body;

        const existe = await Obra.findOne({ titulo, autor: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes una obra con ese título' });
        }

        const obra = await Obra.create({
            titulo, tituloEn, descripcion, serie, precio, categoria,
            imagenPortada, imagenes, enVenta,
            autor: req.usuario._id
        });

        res.status(201).json({ ok: true, obra });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObras = async (req, res) => {
    try {
        const obras = await Obra.find({ disponible: true })
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: obras.length, obras });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener las obras', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id)
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico');

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        res.status(200).json({ ok: true, obra });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id);

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        if (obra.autor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar esta obra' });
        }

        const obraActualizada = await Obra.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({ ok: true, obra: obraActualizada });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id);

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        if (obra.autor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar esta obra' });
        }

        await obra.deleteOne();

        res.status(200).json({ ok: true, mensaje: 'Obra eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObrasPropiasAdmin = async (req, res) => {
    try {
        const obras = await Obra.find({ autor: req.usuario._id }).sort({ createdAt: -1 });
        res.status(200).json({ ok: true, total: obras.length, obras });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener tus obras', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { crearObra, obtenerObras, obtenerObra, actualizarObra, eliminarObra, obtenerObrasPropiasAdmin };
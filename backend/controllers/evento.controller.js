const Evento = require('../models/Evento');

const crearEvento = async (req, res) => {
    try {
        const { titulo, descripcion, tipo, fecha, hora, linkSala, accesoPúblico, cupos } = req.body;
        const existe = await Evento.findOne({ titulo, creador: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes un evento con ese título' });
        }
        const datosEvento = {
            titulo, descripcion, tipo, fecha, hora,
            linkSala, accesoPúblico, cupos,
            creador: req.usuario._id
        };
        if (req.file) {
            datosEvento.imagenPortada = req.file.path;
            datosEvento.imagenPortadaPublicId = req.file.filename;
        }
        const evento = await Evento.create(datosEvento);
        res.status(201).json({ ok: true, evento });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerEventos = async (req, res) => {
    try {
        const { tipo } = req.query;
        const filtro = { activo: true };
        if (tipo) filtro.tipo = tipo;
        const eventos = await Evento.find(filtro)
            .populate('creador', 'nombreCompleto')
            .sort({ fecha: 1 });
        res.status(200).json({ ok: true, total: eventos.length, eventos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los eventos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id)
            .populate('creador', 'nombreCompleto');
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        res.status(200).json({ ok: true, evento });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        if (evento.creador.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar este evento' });
        }
        const datosActualizados = { ...req.body };
        if (req.file) {
            datosActualizados.imagenPortada = req.file.path;
            datosActualizados.imagenPortadaPublicId = req.file.filename;
        }
        const eventoActualizado = await Evento.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { returnDocument: 'after', runValidators: true }
        );
        res.status(200).json({ ok: true, evento: eventoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        if (evento.creador.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar este evento' });
        }
        await evento.deleteOne();
        res.status(200).json({ ok: true, mensaje: 'Evento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerViernesCulturales = async (req, res) => {
    try {
        const viernes = await Evento.find({ tipo: 'viernes-cultural', activo: true })
            .sort({ fecha: 1 });
        res.status(200).json({ ok: true, total: viernes.length, viernes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los Viernes Culturales', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { crearEvento, obtenerEventos, obtenerEvento, actualizarEvento, eliminarEvento, obtenerViernesCulturales };
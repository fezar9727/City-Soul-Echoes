const Evento = require('../models/Evento');
const cloudinary = require('../config/cloudinary');

// Tiempo que un evento permanece en la papelera antes de purgarse definitivamente
const DIAS_EN_PAPELERA = 30;
const MS_EN_PAPELERA = DIAS_EN_PAPELERA * 24 * 60 * 60 * 1000;

const crearEvento = async (req, res) => {
    try {
        const { titulo, descripcion, tipo, fecha, hora, linkSala, accesoPúblico, cupos } = req.body;
        const existe = await Evento.findOne({ titulo, creador: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes un evento con ese título' });
        }
        const esAdmin = req.usuario.rol === 'admin';
        const datosEvento = {
            titulo, descripcion, tipo, fecha, hora,
            linkSala, accesoPúblico, cupos,
            creador: req.usuario._id,
            estadoModeracion: esAdmin ? 'aprobado' : 'pendiente',
            esOficial: esAdmin
        };
        if (req.file) {
            datosEvento.imagenPortada = req.file.path;
            datosEvento.imagenPortadaPublicId = req.file.filename;
        }
        const evento = await Evento.create(datosEvento);
        res.status(201).json({
            ok: true,
            evento,
            mensaje: esAdmin ? 'Evento publicado correctamente' : 'Tu evento quedó en revisión, te avisaremos cuando sea aprobado'
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerEventos = async (req, res) => {
    try {
        const { tipo } = req.query;
        const filtro = { activo: true, eliminada: false, estadoModeracion: 'aprobado' };
        if (tipo) filtro.tipo = tipo;
        const eventos = await Evento.find(filtro)
            .populate('creador', 'nombreCompleto')
            .sort({ esOficial: -1, fecha: 1 });
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

// Soft-delete: el evento se marca como eliminado y se mueve a la papelera,
// no se borra de la base de datos todavía — mismo patrón que Obras.
const eliminarEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        if (evento.creador.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar este evento' });
        }
        evento.eliminada = true;
        evento.fechaEliminacion = new Date();
        await evento.save();
        res.status(200).json({ ok: true, mensaje: 'Evento movido a la papelera' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Devuelve los eventos en papelera, con purga automática de los que ya
// superaron los 30 días (lazy purge, mismo patrón que Obras).
const obtenerPapelera = async (req, res) => {
    try {
        const ahora = Date.now();
        const eventosEnPapelera = await Evento.find({ eliminada: true });

        const paraPurgar = eventosEnPapelera.filter((evento) => {
            const tiempoEnPapelera = ahora - new Date(evento.fechaEliminacion).getTime();
            return tiempoEnPapelera >= MS_EN_PAPELERA;
        });

        for (const evento of paraPurgar) {
            if (evento.imagenPortadaPublicId) {
                await cloudinary.uploader.destroy(evento.imagenPortadaPublicId);
            }
            await evento.deleteOne();
        }

        const eventosVigentes = eventosEnPapelera.filter((evento) => !paraPurgar.includes(evento));
        const eventosConDiasRestantes = eventosVigentes.map((evento) => {
            const tiempoEnPapelera = ahora - new Date(evento.fechaEliminacion).getTime();
            const diasRestantes = Math.max(0, Math.ceil((MS_EN_PAPELERA - tiempoEnPapelera) / (24 * 60 * 60 * 1000)));
            return { ...evento.toObject(), diasRestantes };
        });

        res.status(200).json({ ok: true, total: eventosConDiasRestantes.length, eventos: eventosConDiasRestantes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la papelera', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const restaurarEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        evento.eliminada = false;
        evento.fechaEliminacion = null;
        await evento.save();
        res.status(200).json({ ok: true, mensaje: 'Evento restaurado correctamente', evento });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al restaurar el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarDefinitivo = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        if (evento.imagenPortadaPublicId) {
            await cloudinary.uploader.destroy(evento.imagenPortadaPublicId);
        }
        await evento.deleteOne();
        res.status(200).json({ ok: true, mensaje: 'Evento eliminado definitivamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar definitivamente', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerViernesCulturales = async (req, res) => {
    try {
        const viernes = await Evento.find({ tipo: 'viernes-cultural', activo: true, eliminada: false })
            .sort({ fecha: 1 });
        res.status(200).json({ ok: true, total: viernes.length, viernes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los Viernes Culturales', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Lista solo eventos pendientes de revisión — panel admin de moderación
const obtenerPendientesModeracion = async (req, res) => {
    try {
        const eventos = await Evento.find({ estadoModeracion: 'pendiente', eliminada: false })
            .populate('creador', 'nombreCompleto correo')
            .sort({ createdAt: 1 });
        res.status(200).json({ ok: true, total: eventos.length, eventos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener pendientes de moderación', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Aprueba o rechaza un evento en revisión. Si rechaza, requiere motivo
// — es lo que el usuario ve para saber qué corregir.
const moderarEvento = async (req, res) => {
    try {
        const { decision, motivoRechazo } = req.body;
        if (!['aprobado', 'rechazado'].includes(decision)) {
            return res.status(400).json({ ok: false, mensaje: 'Decisión inválida, debe ser aprobado o rechazado' });
        }
        if (decision === 'rechazado' && !motivoRechazo) {
            return res.status(400).json({ ok: false, mensaje: 'Debés indicar el motivo del rechazo' });
        }
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
        }
        evento.estadoModeracion = decision;
        evento.motivoRechazo = decision === 'rechazado' ? motivoRechazo : '';
        await evento.save();
        res.status(200).json({ ok: true, mensaje: `Evento ${decision} correctamente`, evento });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al moderar el evento', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = {
    crearEvento,
    obtenerEventos,
    obtenerEvento,
    actualizarEvento,
    eliminarEvento,
    obtenerPapelera,
    restaurarEvento,
    eliminarDefinitivo,
    obtenerViernesCulturales,
    obtenerPendientesModeracion,
    moderarEvento
};
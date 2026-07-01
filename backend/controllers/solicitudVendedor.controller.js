const SolicitudVendedor = require('../models/SolicitudVendedor');
const Usuario = require('../models/Usuario');

const crearSolicitud = async (req, res) => {
    try {
        const { descripcionProductos, categoria, datosPago, aceptaTerminos } = req.body;

        if (req.usuario.puedeVender) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes permiso para vender' });
        }

        const existe = await SolicitudVendedor.findOne({ usuario: req.usuario._id, estado: 'pendiente' });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes una solicitud pendiente de revisión' });
        }

        const solicitud = await SolicitudVendedor.create({
            usuario: req.usuario._id,
            descripcionProductos,
            categoria,
            datosPago,
            aceptaTerminos
        });

        res.status(201).json({ ok: true, solicitud });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear la solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerSolicitudes = async (req, res) => {
    try {
        const { estado } = req.query;
        const filtro = {};
        if (estado) filtro.estado = estado;

        const solicitudes = await SolicitudVendedor.find(filtro)
            .populate('usuario', 'nombreCompleto correo')
            .populate('revisadaPor', 'nombreCompleto')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: solicitudes.length, solicitudes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener las solicitudes', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerMiSolicitud = async (req, res) => {
    try {
        const solicitud = await SolicitudVendedor.findOne({ usuario: req.usuario._id })
            .sort({ createdAt: -1 });

        if (!solicitud) {
            return res.status(404).json({ ok: false, mensaje: 'No tienes ninguna solicitud registrada' });
        }

        res.status(200).json({ ok: true, solicitud });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener tu solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const aprobarSolicitud = async (req, res) => {
    try {
        const solicitud = await SolicitudVendedor.findById(req.params.id);

        if (!solicitud) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
        }

        if (solicitud.estado !== 'pendiente') {
            return res.status(409).json({ ok: false, mensaje: `Esta solicitud ya fue ${solicitud.estado}` });
        }

        solicitud.estado = 'aprobada';
        solicitud.revisadaPor = req.usuario._id;
        solicitud.fechaRevision = Date.now();
        await solicitud.save();

        await Usuario.findByIdAndUpdate(solicitud.usuario, { puedeVender: true });

        res.status(200).json({ ok: true, mensaje: 'Solicitud aprobada — el usuario ya puede vender', solicitud });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al aprobar la solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const rechazarSolicitud = async (req, res) => {
    try {
        const { motivoRechazo } = req.body;
        const solicitud = await SolicitudVendedor.findById(req.params.id);

        if (!solicitud) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
        }

        if (solicitud.estado !== 'pendiente') {
            return res.status(409).json({ ok: false, mensaje: `Esta solicitud ya fue ${solicitud.estado}` });
        }

        solicitud.estado = 'rechazada';
        solicitud.motivoRechazo = motivoRechazo || 'No especificado';
        solicitud.revisadaPor = req.usuario._id;
        solicitud.fechaRevision = Date.now();
        await solicitud.save();

        res.status(200).json({ ok: true, mensaje: 'Solicitud rechazada', solicitud });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al rechazar la solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { crearSolicitud, obtenerSolicitudes, obtenerMiSolicitud, aprobarSolicitud, rechazarSolicitud };
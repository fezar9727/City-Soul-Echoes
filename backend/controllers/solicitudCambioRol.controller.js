const SolicitudCambioRol = require('../models/SolicitudCambioRol');
const Usuario = require('../models/Usuario');
const Suscripcion = require('../models/Suscripcion');
const Pago = require('../models/Pago');
const crypto = require('crypto');
const PRECIOS_PLANES = require('../config/planes');
const calcularProrrateo = require('../utils/calcularProrrateo');
const generarReferenciaPago = require('../utils/generarReferenciaPago');
const { enviarCorreoActualizacionPlan } = require('../services/email.service');

const crearSolicitud = async (req, res) => {
    try {
        const { rolSolicitado, perfilArtista, perfilDocente } = req.body;

        if (req.usuario.rol === rolSolicitado) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes ese rol' });
        }

        const existe = await SolicitudCambioRol.findOne({ usuario: req.usuario._id, estado: 'pendiente' });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes una solicitud pendiente de revisión' });
        }

        const solicitud = await SolicitudCambioRol.create({
            usuario: req.usuario._id,
            rolActual: req.usuario.rol,
            rolSolicitado,
            perfilArtista: perfilArtista || null,
            perfilDocente: perfilDocente || null
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

        const solicitudes = await SolicitudCambioRol.find(filtro)
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
        const solicitud = await SolicitudCambioRol.findOne({ usuario: req.usuario._id })
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
        const solicitud = await SolicitudCambioRol.findById(req.params.id);
        if (!solicitud) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
        }
        if (solicitud.estado !== 'pendiente') {
            return res.status(409).json({ ok: false, mensaje: `Esta solicitud ya fue ${solicitud.estado}` });
        }

        const suscripcionActual = await Suscripcion.findOne({ usuario: solicitud.usuario });
        if (!suscripcionActual) {
            return res.status(409).json({ ok: false, mensaje: 'El usuario no tiene una suscripción activa, no se puede procesar el cambio de rol' });
        }

        const precioPlanNuevo = PRECIOS_PLANES[solicitud.rolSolicitado];
        if (!precioPlanNuevo) {
            return res.status(400).json({ ok: false, mensaje: 'No hay un precio configurado para ese rol' });
        }

        const { montoAPagar } = calcularProrrateo({
            precioPlanActual: suscripcionActual.precio,
            precioPlanNuevo,
            fechaVencimientoActual: suscripcionActual.fechaVencimiento
        });

        solicitud.estado = 'aprobada';
        solicitud.revisadaPor = req.usuario._id;
        solicitud.fechaRevision = Date.now();
        await solicitud.save();

        let pagoExcedente = null;

        if (montoAPagar > 0) {
            // El rol y el perfil NO se aplican todavia — solo se activan
            // cuando Wompi confirme el pago, via webhookWompi en
            // pago.controller.js (mismo criterio ya usado para vendedor:
            // puedeVender se activa recien tras el pago confirmado).
            const referencia = generarReferenciaPago();
            const pagoCreado = await Pago.create({
                referencia,
                usuario: solicitud.usuario,
                concepto: 'actualizacion_plan',
                conceptoId: suscripcionActual._id,
                conceptoModel: 'Suscripcion',
                monto: montoAPagar,
                planDestino: solicitud.rolSolicitado,
                precioPlanDestino: precioPlanNuevo
            });

            const montoEnCentavos = montoAPagar * 100;
            const cadenaIntegridad = `${referencia}${montoEnCentavos}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
            const firma = crypto.createHash('sha256').update(cadenaIntegridad).digest('hex');

            pagoExcedente = {
                ...pagoCreado.toObject(),
                wompi: {
                    publicKey: process.env.WOMPI_PUBLIC_KEY,
                    currency: 'COP',
                    amountInCents: montoEnCentavos,
                    reference: referencia,
                    signature: firma,
                    redirectUrl: `${process.env.CLIENT_URL}/pago-completado`
                }
            };
        } else {
            // Sin excedente que cobrar (ej. aprobado al final del ciclo) —
            // se aplica el cambio de rol directo, sin esperar ningún pago.
            suscripcionActual.plan = solicitud.rolSolicitado;
            suscripcionActual.precio = precioPlanNuevo;
            await suscripcionActual.save();

            const cambios = { rol: solicitud.rolSolicitado };
            if (solicitud.rolSolicitado === 'artista' && solicitud.perfilArtista) cambios.perfilArtista = solicitud.perfilArtista;
            if (solicitud.rolSolicitado === 'docente' && solicitud.perfilDocente) cambios.perfilDocente = solicitud.perfilDocente;
            await Usuario.findByIdAndUpdate(solicitud.usuario, cambios);
        }

        const usuarioAprobado = await Usuario.findById(solicitud.usuario);
        await enviarCorreoActualizacionPlan(
            usuarioAprobado.correo,
            usuarioAprobado.nombreCompleto,
            solicitud.rolActual,
            solicitud.rolSolicitado,
            precioPlanNuevo,
            montoAPagar
        );

        res.status(200).json({
            ok: true,
            mensaje: montoAPagar > 0
                ? 'Solicitud aprobada — se generó el pago del excedente, el rol se activará al confirmarse'
                : 'Solicitud aprobada — rol actualizado directamente',
            solicitud,
            pagoExcedente
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al aprobar la solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const rechazarSolicitud = async (req, res) => {
    try {
        const { motivoRechazo } = req.body;
        const solicitud = await SolicitudCambioRol.findById(req.params.id);
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
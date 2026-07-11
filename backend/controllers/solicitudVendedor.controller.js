const SolicitudVendedor = require('../models/SolicitudVendedor');
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

        const suscripcionActual = await Suscripcion.findOne({ usuario: solicitud.usuario });

        if (!suscripcionActual) {
            return res.status(409).json({ ok: false, mensaje: 'El usuario no tiene una suscripción activa, no se puede procesar la actualización de plan' });
        }

        if (suscripcionActual.plan === 'vendedor') {
            return res.status(409).json({ ok: false, mensaje: 'El usuario ya tiene el plan vendedor' });
        }

        const planAnterior = suscripcionActual.plan;
        // Nota: puedeVender NO se activa aca todavia. Solo se activa cuando
        // Wompi confirme el pago del excedente, via webhookWompi en pago.controller.js.

        const precioPlanNuevo = PRECIOS_PLANES.vendedor;

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
            const referencia = generarReferenciaPago();

            pagoExcedente = await Pago.create({
                referencia,
                usuario: solicitud.usuario,
                concepto: 'actualizacion_plan',
                conceptoId: suscripcionActual._id,
                conceptoModel: 'Suscripcion',
                monto: montoAPagar,
                planDestino: 'vendedor',
                precioPlanDestino: precioPlanNuevo
            });

            const montoEnCentavos = montoAPagar * 100;
            const cadenaIntegridad = `${referencia}${montoEnCentavos}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
            const firma = crypto.createHash('sha256').update(cadenaIntegridad).digest('hex');

            pagoExcedente = {
                ...pagoExcedente.toObject(),
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
            // Si el excedente calculado es 0 (por ejemplo, aprobado el ultimo dia del ciclo),
            // se activa el plan directamente sin necesidad de cobrar nada.
            suscripcionActual.plan = 'vendedor';
            suscripcionActual.precio = precioPlanNuevo;
            await suscripcionActual.save();
            await Usuario.findByIdAndUpdate(solicitud.usuario, { puedeVender: true });
        }

        const usuarioAprobado = await Usuario.findById(solicitud.usuario);

        await enviarCorreoActualizacionPlan(
            usuarioAprobado.correo,
            usuarioAprobado.nombreCompleto,
            planAnterior,
            'vendedor',
            precioPlanNuevo,
            montoAPagar
        );

        res.status(200).json({
            ok: true,
            mensaje: montoAPagar > 0
                ? 'Solicitud aprobada — se generó el pago del excedente, el usuario podrá vender apenas se confirme'
                : 'Solicitud aprobada — plan actualizado directamente, el usuario ya puede vender',
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

const crypto = require('crypto');
const Pago = require('../models/Pago');
const Suscripcion = require('../models/Suscripcion');
const Usuario = require('../models/Usuario');
const verificarFirmaWompi = require('../utils/verificarFirmaWompi');
const { enviarCorreoActualizacionPlan } = require('../services/email.service');
const generarReferencia = require('../utils/generarReferenciaPago');
const iniciarPago = async (req, res) => {
    try {
        const { concepto, conceptoId, monto } = req.body;

        const referencia = generarReferencia();

        const pago = await Pago.create({
            referencia,
            usuario: req.usuario._id,
            concepto,
            conceptoId,
            conceptoModel: concepto === 'producto' ? 'Producto' : 'Suscripcion',
            monto
        });

        const montoEnCentavos = monto * 100;

        const cadenaIntegridad = `${referencia}${montoEnCentavos}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
        const firma = crypto.createHash('sha256').update(cadenaIntegridad).digest('hex');

        res.status(201).json({
            ok: true,
            pago,
            wompi: {
                publicKey: process.env.WOMPI_PUBLIC_KEY,
                currency: 'COP',
                amountInCents: montoEnCentavos,
                reference: referencia,
                signature: firma,
                redirectUrl: `${process.env.CLIENT_URL}/pago-completado`
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al iniciar el pago', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const webhookWompi = async (req, res) => {
    try {
        const { event, data } = req.body;

        if (!event || !data) {
            return res.status(400).json({ ok: false, mensaje: 'Datos de webhook inválidos' });
        }

        // CAPA DE SEGURIDAD 1: verificar que el webhook realmente viene de Wompi
        // y no fue falsificado por un tercero. Se rechaza sin procesar nada
        // si la firma no coincide.
        const firmaValida = verificarFirmaWompi(req.body);
        if (!firmaValida) {
            return res.status(401).json({ ok: false, mensaje: 'Firma de webhook inválida' });
        }

        if (event === 'transaction.updated') {
            const transaccion = data.transaction;
            const referencia = transaccion.reference;

            const pago = await Pago.findOne({ referencia });
            if (!pago) {
                return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
            }

            // CAPA DE SEGURIDAD 2: idempotencia. Wompi puede reenviar el mismo
            // webhook mas de una vez (reintentos por timeout de red). Si este
            // pago ya fue procesado como aprobado antes, no se vuelve a procesar
            // para evitar activar suscripciones o cobros duplicados.
            if (pago.estado === 'aprobado') {
                return res.status(200).json({ ok: true, mensaje: 'Evento ya procesado anteriormente, ignorado' });
            }

            const estadoMap = {
                'APPROVED': 'aprobado',
                'DECLINED': 'rechazado',
                'ERROR': 'error',
                'PENDING': 'pendiente'
            };

            pago.estado = estadoMap[transaccion.status] || 'pendiente';
            pago.wompiTransaccionId = transaccion.id;
            pago.wompiRespuesta = transaccion;
            await pago.save();

            if (pago.estado === 'aprobado' && pago.concepto === 'suscripcion') {
                const fechaVencimiento = new Date();
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

                await Suscripcion.findOneAndUpdate(
                    { usuario: pago.usuario },
                    {
                        estado: 'activa',
                        fechaVencimiento,
                        ultimoPago: pago._id
                    },
                    { upsert: true, new: true }
                );
            }

            // Caso nuevo de la Fase 7.4: pago del excedente por cambio de plan
            // (usuario aprobado como vendedor). Recien aca, con el pago
            // confirmado por Wompi, se activa puedeVender y se actualiza el plan.
            if (pago.estado === 'aprobado' && pago.concepto === 'actualizacion_plan') {
                const suscripcion = await Suscripcion.findById(pago.conceptoId);

                if (suscripcion) {
                    const fechaVencimiento = new Date();
                    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

                    suscripcion.plan = pago.planDestino;
                    suscripcion.precio = pago.precioPlanDestino;
                    suscripcion.fechaVencimiento = fechaVencimiento;
                    suscripcion.ultimoPago = pago._id;
                    await suscripcion.save();

                    if (pago.planDestino === 'vendedor') {
                        await Usuario.findByIdAndUpdate(pago.usuario, { puedeVender: true });
                    }

                    const usuarioActualizado = await Usuario.findById(pago.usuario);
                    if (usuarioActualizado) {
                        await enviarCorreoActualizacionPlan(
                            usuarioActualizado.correo,
                            usuarioActualizado.nombreCompleto,
                            'pendiente de pago',
                            pago.planDestino,
                            pago.precioPlanDestino,
                            0
                        );
                    }
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al procesar webhook', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerMisPagos = async (req, res) => {
    try {
        const pagos = await Pago.find({ usuario: req.usuario._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: pagos.length, pagos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los pagos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerTodosLosPagos = async (req, res) => {
    try {
        const { estado } = req.query;
        const filtro = {};
        if (estado) filtro.estado = estado;

        const pagos = await Pago.find(filtro)
            .populate('usuario', 'nombreCompleto correo')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: pagos.length, pagos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los pagos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerMiSuscripcion = async (req, res) => {
    try {
        const suscripcion = await Suscripcion.findOne({ usuario: req.usuario._id })
            .populate('ultimoPago');

        if (!suscripcion) {
            return res.status(404).json({ ok: false, mensaje: 'No tienes una suscripción activa' });
        }

        res.status(200).json({ ok: true, suscripcion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la suscripción', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { iniciarPago, webhookWompi, obtenerMisPagos, obtenerTodosLosPagos, obtenerMiSuscripcion };
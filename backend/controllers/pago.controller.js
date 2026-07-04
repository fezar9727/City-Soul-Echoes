const axios = require('axios');
const crypto = require('crypto');
const Pago = require('../models/Pago');
const Suscripcion = require('../models/Suscripcion');

const WOMPI_API = 'https://sandbox.wompi.co/v1';

const generarReferencia = () => {
    return `CSE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

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
        const { event, data, signature } = req.body;

        if (!event || !data) {
            return res.status(400).json({ ok: false, mensaje: 'Datos de webhook inválidos' });
        }

        if (event === 'transaction.updated') {
            const transaccion = data.transaction;
            const referencia = transaccion.reference;

            const pago = await Pago.findOne({ referencia });
            if (!pago) {
                return res.status(404).json({ ok: false, mensaje: 'Pago no encontrado' });
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
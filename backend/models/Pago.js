const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    referencia: {
        type: String,
        required: true,
        unique: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    concepto: {
        type: String,
        enum: {
            values: ['producto', 'suscripcion'],
            message: '{VALUE} no es un concepto válido'
        },
        required: true
    },
    conceptoId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'conceptoModel'
    },
    conceptoModel: {
        type: String,
        enum: ['Producto', 'Suscripcion']
    },
    monto: {
        type: Number,
        required: true,
        min: [0, 'El monto no puede ser negativo']
    },
    moneda: {
        type: String,
        default: 'COP'
    },
    estado: {
        type: String,
        enum: {
            values: ['pendiente', 'aprobado', 'rechazado', 'error'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'pendiente'
    },
    wompiTransaccionId: {
        type: String,
        default: ''
    },
    wompiRespuesta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Pago', pagoSchema);
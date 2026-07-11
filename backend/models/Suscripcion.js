const mongoose = require('mongoose');

const suscripcionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        unique: true
    },
    plan: {
        type: String,
        enum: {
            values: ['basico', 'vendedor', 'artista', 'docente'],
            message: '{VALUE} no es un plan válido'
        },
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: {
            values: ['activa', 'vencida', 'cancelada'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'activa'
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaVencimiento: {
        type: Date,
        required: true
    },
    renovacionAutomatica: {
        type: Boolean,
        default: false
    },
    ultimoPago: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pago'
    }
}, { timestamps: true });

module.exports = mongoose.model('Suscripcion', suscripcionSchema);
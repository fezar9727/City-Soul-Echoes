const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        maxlength: [1000, 'La descripción no puede superar los 1000 caracteres'],
        default: ''
    },
    tipo: {
        type: String,
        enum: {
            values: ['evento', 'viernes-cultural'],
            message: '{VALUE} no es un tipo válido'
        },
        required: [true, 'El tipo de evento es obligatorio']
    },
    fecha: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    hora: {
        type: String,
        default: '19:00'
    },
    linkSala: {
        type: String,
        default: ''
    },
    accesoPúblico: {
        type: Boolean,
        default: true
    },
    cupos: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Evento', eventoSchema);
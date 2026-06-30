const mongoose = require('mongoose');

const pistaSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    artista: { type: String, trim: true, default: '' },
    url: { type: String, required: true },
    duracionSegundos: { type: Number, default: 0 },
    orden: { type: Number, required: true }
}, { _id: false });

const soulStationSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la estación es obligatorio'],
        trim: true,
        default: 'Soul Station'
    },
    descripcion: {
        type: String,
        maxlength: [500, 'La descripción no puede superar los 500 caracteres'],
        default: ''
    },
    enVivo: {
        type: Boolean,
        default: false
    },
    linkTransmision: {
        type: String,
        default: ''
    },
    playlist: {
        type: [pistaSchema],
        default: []
    },
    pistaActual: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SoulStation', soulStationSchema);
const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
    src: { type: String, required: true },
    titulo: { type: String, trim: true, default: '' },
    tituloEn: { type: String, trim: true, default: '' },
    desc: { type: String, default: '' }
}, { _id: false });

const obraSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    tituloEn: {
        type: String,
        trim: true,
        default: ''
    },
    descripcion: {
        type: String,
        maxlength: [1000, 'La descripción no puede superar los 1000 caracteres'],
        default: ''
    },
    serie: {
        type: String,
        trim: true,
        default: ''
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [1, 'El precio debe ser mayor a 0']
    },
    categoria: {
        type: String,
        enum: {
            values: ['pintura', 'escultura', 'musica', 'digital', 'fotografia', 'otro'],
            message: '{VALUE} no es una categoría válida'
        },
        required: [true, 'La categoría es obligatoria']
    },
    imagenPortada: {
        type: String,
        required: [true, 'La imagen de portada es obligatoria']
    },
    imagenes: {
        type: [imagenSchema],
        default: []
    },
    disponible: {
        type: Boolean,
        default: true
    },
    enVenta: {
        type: Boolean,
        default: false
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }, 
    eliminada: {
        type: Boolean,
        default: false
    },
    fechaEliminacion: {
        type: Date,
        default: null
    },
    imagenPortadaPublicId: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Obra', obraSchema);
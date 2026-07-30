const mongoose = require('mongoose');

const leccionSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    duracionMinutos: { type: Number, default: 0 },
    orden: { type: Number, required: true }
}, { _id: false });

const cursoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        maxlength: [2000, 'La descripción no puede superar los 2000 caracteres'],
        default: ''
    },
    categoria: {
        type: String,
        enum: {
            values: ['arte', 'escultura', 'musica', 'digital', 'fotografia', 'emprendimiento', 'bienestar', 'otro'],
            message: '{VALUE} no es una categoría válida'
        },
        required: [true, 'La categoría es obligatoria']
    },
    modalidad: {
        type: String,
        enum: {
            values: ['virtual', 'presencial', 'mixta'],
            message: '{VALUE} no es una modalidad válida'
        },
        default: 'virtual'
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    duracionHoras: {
        type: Number,
        default: 0
    },
    imagenPortada: {
        type: String,
        default: ''
    },
    imagenPortadaPublicId: {
        type: String,
        default: ''
    },
    lecciones: {
        type: [leccionSchema],
        default: []
    },
    publicado: {
        type: Boolean,
        default: false
    },
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);
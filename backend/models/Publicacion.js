const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
    contenido: { type: String, required: true, trim: true, maxlength: [500, 'El comentario no puede superar los 500 caracteres'] },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, default: Date.now }
}, { _id: false });

const publicacionSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
        trim: true,
        maxlength: [2000, 'La publicación no puede superar los 2000 caracteres']
    },
    imagenes: {
        type: [String],
        default: []
    },
    tipo: {
        type: String,
        enum: {
            values: ['comunidad', 'muro-artistas'],
            message: '{VALUE} no es un tipo válido'
        },
        required: [true, 'El tipo de publicación es obligatorio']
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Usuario',
        default: []
    },
    comentarios: {
        type: [comentarioSchema],
        default: []
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Publicacion', publicacionSchema);
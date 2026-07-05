const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    url: { type: String, required: true },
    urlImagen: { type: String },
    fuente: { type: String },
    fechaPublicacion: { type: Date }
}, { _id: false });

const noticiaCacheSchema = new mongoose.Schema({
    categoria: {
        type: String,
        enum: {
            values: ['noticias', 'cultura', 'videojuegos'],
            message: 'La categoría {VALUE} no es válida'
        },
        required: true,
        unique: true
    },
    articulos: [articuloSchema],
    fechaActualizacion: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('NoticiaCache', noticiaCacheSchema);
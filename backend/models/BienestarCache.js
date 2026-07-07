const mongoose = require('mongoose');

// Sub-esquema reutilizable para un solo elemento dentro de cualquier categoría de Bienestar.
// Un solo esquema flexible cubre las 3 categorías (receta vegana, frase de salud mental,
// perfil de diseñador) en vez de crear 3 esquemas separados — mismo patrón de reutilización
// que ya usamos en NoticiaCache.js.
const itemBienestarSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    imagenUrl: {
        type: String,
        default: ''
    },
    enlaceOficial: {
        type: String,
        default: ''
    },
    pais: {
        type: String,
        default: ''
    }
}, { _id: false });

const bienestarCacheSchema = new mongoose.Schema({
    categoria: {
        type: String,
        enum: {
            values: ['vegana', 'salud-mental', 'moda-inclusiva'],
            message: '{VALUE} no es una categoría válida de Bienestar'
        },
        required: true,
        unique: true
    },
    items: {
        type: [itemBienestarSchema],
        default: []
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('BienestarCache', bienestarCacheSchema);
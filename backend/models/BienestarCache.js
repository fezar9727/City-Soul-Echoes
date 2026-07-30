const mongoose = require('mongoose');

const itemBienestarSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    detalleCompleto: { type: String, default: '' },
    enlaceProfundizar: { type: String, default: '' },
    youtubeSearch: { type: String, default: '' },
    enlacesReferencia: { type: [{ nombre: String, url: String }], default: [] },
    imagenUrl: { type: String, default: '' },
    enlaceOficial: { type: String, default: '' },
    tipoEnlaceOficial: {
        type: String,
        enum: { values: ['instagram', 'facebook', 'web', 'fuente'], message: '{VALUE} no es un tipoEnlaceOficial válido' },
        default: undefined
    },
    pais: { type: String, default: '' },
    etiqueta: { type: String, default: '' },
    telefono: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
}, { _id: false });

const bienestarCacheSchema = new mongoose.Schema({
    categoria: {
        type: String,
        enum: { values: ['vegana', 'salud-mental', 'moda-inclusiva'], message: '{VALUE} no es una categoría válida de Bienestar' },
        required: true,
        unique: true
    },
    items: { type: [itemBienestarSchema], default: [] },
    fechaActualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BienestarCache', bienestarCacheSchema);
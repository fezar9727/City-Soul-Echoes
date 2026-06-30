const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
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
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    categoria: {
        type: String,
        enum: {
            values: ['artesania', 'escultura', 'pintura', 'fotografia', 'digital', 'musica', 'otro'],
            message: '{VALUE} no es una categoría válida'
        },
        required: [true, 'La categoría es obligatoria']
    },
    imagenes: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 1,
        min: [0, 'El stock no puede ser negativo']
    },
    disponible: {
        type: Boolean,
        default: true
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
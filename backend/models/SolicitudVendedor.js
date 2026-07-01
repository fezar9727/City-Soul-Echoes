const mongoose = require('mongoose');

const solicitudVendedorSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        unique: true
    },
    descripcionProductos: {
        type: String,
        required: [true, 'Debes describir qué productos quieres vender'],
        maxlength: [500, 'La descripción no puede superar los 500 caracteres']
    },
    categoria: {
        type: String,
        enum: {
            values: ['artesania', 'escultura', 'pintura', 'fotografia', 'digital', 'musica', 'otro'],
            message: '{VALUE} no es una categoría válida'
        },
        required: [true, 'La categoría es obligatoria']
    },
    datosPago: {
        nequi: { type: String, default: '' },
        llavePublicaWompi: { type: String, default: '' }
    },
    aceptaTerminos: {
        type: Boolean,
        required: [true, 'Debes aceptar los términos de venta']
    },
    estado: {
        type: String,
        enum: {
            values: ['pendiente', 'aprobada', 'rechazada'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'pendiente'
    },
    motivoRechazo: {
        type: String,
        default: ''
    },
    revisadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaRevision: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('SolicitudVendedor', solicitudVendedorSchema);
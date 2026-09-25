const mongoose = require('mongoose');

// Mismo patrón que SolicitudVendedor.js — generalizado para cubrir
// tanto artista como docente, ya que ambos siguen el mismo flujo real:
// el usuario pide el cambio, el admin aprueba/rechaza, y si aprueba,
// se calcula el prorrateo del excedente con calcularProrrateo.js
// (misma lógica ya usada en solicitudVendedor.controller.js).
const solicitudCambioRolSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    rolActual: {
        type: String,
        enum: ['usuario', 'artista', 'docente'],
        required: true
    },
    rolSolicitado: {
        type: String,
        enum: {
            values: ['usuario', 'artista', 'docente'],
            message: '{VALUE} no es un rol válido'
        },
        required: [true, 'El rol solicitado es obligatorio']
    },
    perfilArtista: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    perfilDocente: {
        type: mongoose.Schema.Types.Mixed,
        default: null
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

module.exports = mongoose.model('SolicitudCambioRol', solicitudCambioRolSchema);
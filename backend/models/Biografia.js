const mongoose = require('mongoose');

const parrafoSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    orden: { type: Number, required: true }
}, { _id: false });

const biografiaSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true },
    edad: { type: Number, required: true },
    parrafos: { type: [parrafoSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Biografia', biografiaSchema);
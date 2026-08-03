/**
 * migrarCampoEliminadaEventos.js
 * Agrega eliminada: false y fechaEliminacion: null a los eventos que
 * existían antes de que el modelo tuviera esos campos — sin esto,
 * la query { eliminada: false } los excluye por completo, porque
 * MongoDB no matchea un campo ausente contra el valor false.
 * Uso: node scripts/migrarCampoEliminadaEventos.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Evento = require('../models/Evento');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const resultado = await Evento.updateMany(
        { eliminada: { $exists: false } },
        { $set: { eliminada: false, fechaEliminacion: null } }
    );
    console.log(`Eventos actualizados: ${resultado.modifiedCount}`);
    await mongoose.disconnect();
}

main();
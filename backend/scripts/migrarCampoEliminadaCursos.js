/**
 * migrarCampoEliminadaCursos.js
 * Agrega eliminada: false y fechaEliminacion: null a los cursos que
 * existían antes de que el modelo tuviera esos campos.
 * Uso: node scripts/migrarCampoEliminadaCursos.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Curso = require('../models/Curso');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const resultado = await Curso.updateMany(
        { eliminada: { $exists: false } },
        { $set: { eliminada: false, fechaEliminacion: null } }
    );
    console.log(`Cursos actualizados: ${resultado.modifiedCount}`);
    await mongoose.disconnect();
}

main();
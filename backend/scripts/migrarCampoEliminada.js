/**
 * migrarCampoEliminada.js
 * Las obras creadas antes de agregar el sistema de papelera no tienen
 * los campos eliminada/fechaEliminacion en su documento de Mongo.
 * Este script los agrega con sus valores por defecto, una sola vez.
 * Uso: node scripts/migrarCampoEliminada.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Obra = require('../models/Obra');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const resultado = await Obra.updateMany(
    { eliminada: { $exists: false } },
    { $set: { eliminada: false, fechaEliminacion: null, imagenPortadaPublicId: '' } }
  );

  console.log(`Corregidas: ${resultado.modifiedCount} obras.`);
  await mongoose.disconnect();
}

main();
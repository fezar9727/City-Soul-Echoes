require('dotenv').config();
const mongoose = require('mongoose');
const SoulStation = require('../models/SoulStation');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: falta MONGO_URI en tu archivo .env');
  process.exit(1);
}

async function main() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Conectado.\n');

  try {
    const soulStation = await SoulStation.findOne();

    if (!soulStation) {
      console.error('ERROR: no existe ningún documento SoulStation en la base de datos.');
      process.exit(1);
    }

    const totalAntes = soulStation.playlist.length;
    const urlsVistas = new Set();
    const playlistLimpia = [];

    for (const pista of soulStation.playlist) {
      if (urlsVistas.has(pista.url)) continue;
      urlsVistas.add(pista.url);
      playlistLimpia.push(pista);
    }

    playlistLimpia.forEach((pista, index) => {
      pista.orden = index + 1;
    });

    soulStation.playlist = playlistLimpia;
    await soulStation.save();

    const totalDespues = soulStation.playlist.length;

    console.log('Limpieza completada.');
    console.log(`Pistas antes de limpiar: ${totalAntes}`);
    console.log(`Duplicados eliminados: ${totalAntes - totalDespues}`);
    console.log(`Total final (único): ${totalDespues}`);
  } catch (error) {
    console.error('Error durante la limpieza:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada.');
  }
}

main();



require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const SoulStation = require('../models/SoulStation');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: falta MONGO_URI en tu archivo .env');
  process.exit(1);
}

async function main() {
  const inputPath = path.join(__dirname, 'candidatos-soul-station.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: no se encontró ${inputPath}. Corré primero explorarPistasJamendo.js`);
    process.exit(1);
  }

  const resultadosPorCategoria = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const todosLosCandidatos = resultadosPorCategoria.flatMap((categoria) => categoria.candidatos);

  if (todosLosCandidatos.length === 0) {
    console.error('ERROR: el archivo de candidatos está vacío. Nada para cargar.');
    process.exit(1);
  }

  console.log(`Conectando a MongoDB...`);
  await mongoose.connect(MONGO_URI);
  console.log('Conectado.\n');

  try {
    const soulStation = await SoulStation.findOne();

    if (!soulStation) {
      console.error(
        'ERROR: no existe ningún documento SoulStation en la base de datos. Este script solo agrega pistas a uno ya existente.'
      );
      process.exit(1);
    }

    const pistasActuales = [...(soulStation.playlist || [])];
    const ordenMaximoActual = pistasActuales.reduce(
      (max, pista) => Math.max(max, pista.orden || 0),
      0
    );

    const urlsExistentes = new Set(pistasActuales.map((p) => p.url));

    const candidatosNuevos = todosLosCandidatos.filter(
      (candidato) => !urlsExistentes.has(candidato.url)
    );

    const pistasNuevas = candidatosNuevos.map((candidato, index) => ({
      titulo: candidato.titulo,
      artista: candidato.artista || '',
      url: candidato.url,
      duracionSegundos: candidato.duracionSegundos || 0,
      orden: ordenMaximoActual + index + 1,
    }));

    soulStation.playlist.push(...pistasNuevas);
    await soulStation.save();

    console.log('Carga completada.');
    console.log(`Pistas que ya había: ${pistasActuales.length}`);
    console.log(`Pistas agregadas ahora: ${pistasNuevas.length}`);
    console.log(`Total en la playlist: ${soulStation.playlist.length}`);
  } catch (error) {
    console.error('Error durante la carga:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada.');
  }
}

main();
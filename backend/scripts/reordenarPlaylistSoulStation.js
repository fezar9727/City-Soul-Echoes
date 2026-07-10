/**
 * reordenarPlaylistSoulStation.js
 *
 * Fase 7.3 - Soul Station: renumeración del campo `orden`.
 *
 * Por qué existe:
 * Tras borrar las 2 pistas de prueba manualmente desde Compass, el campo
 * `orden` de las pistas reales quedó arrancando en 3 (arrastrado de cuando
 * las de prueba ocupaban orden 1 y 2), en vez de arrancar limpio en 1.
 * Esto es puramente cosmético — no afecta funcionalidad — pero lo dejamos
 * prolijo para que el dato sea consistente.
 *
 * Qué hace:
 * 1. Trae el documento SoulStation existente.
 * 2. Conserva el orden ACTUAL de las pistas en el array (no las reordena
 *    por título ni por nada más), solo renumera el campo `orden` de cada
 *    una de forma consecutiva: 1, 2, 3... hasta el final.
 * 3. Guarda.
 *
 * Uso:
 *   node scripts/reordenarPlaylistSoulStation.js
 */

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

    soulStation.playlist.forEach((pista, index) => {
      pista.orden = index + 1;
    });

    await soulStation.save();

    const primero = soulStation.playlist[0];
    const ultimo = soulStation.playlist[soulStation.playlist.length - 1];

    console.log('Reordenamiento completado.');
    console.log(`Total de pistas: ${soulStation.playlist.length}`);
    console.log(`Primera pista: "${primero.titulo}" - orden: ${primero.orden}`);
    console.log(`Última pista: "${ultimo.titulo}" - orden: ${ultimo.orden}`);
  } catch (error) {
    console.error('Error durante el reordenamiento:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada.');
  }
}

main();
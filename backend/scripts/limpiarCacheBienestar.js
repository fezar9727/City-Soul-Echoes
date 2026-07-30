/**
 * limpiarCacheBienestar.js
 * Borra el cache viejo de Bienestar en MongoDB (datos de TheMealDB/ZenQuotes)
 * para forzar que el controller genere el contenido curado nuevo la próxima
 * vez que se consulte cada categoría. Uso único, tras cambiar de API a
 * datos curados.
 * Uso: node scripts/limpiarCacheBienestar.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const BienestarCache = require('../models/BienestarCache');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const resultado = await BienestarCache.deleteMany({});
    console.log(`Cache eliminado: ${resultado.deletedCount} documentos.`);
    await mongoose.disconnect();
}

main();
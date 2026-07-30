/**
 * limpiarCacheNoticias.js
 * Borra el cache de NoticiaCache en MongoDB para forzar que la próxima
 * consulta a /api/noticias vaya directo a NewsData.io con la query nueva,
 * en vez de esperar las 2 horas de vigencia del cache.
 * Uso: node scripts/limpiarCacheNoticias.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const NoticiaCache = require('../models/NoticiaCache');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const resultado = await NoticiaCache.deleteMany({});
    console.log(`Cache eliminado: ${resultado.deletedCount} documentos.`);
    await mongoose.disconnect();
}

main();
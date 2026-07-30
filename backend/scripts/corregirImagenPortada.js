/**
 * corregirImagenPortada.js
 *
 * Corrige un dato mal cargado desde la carga inicial de las 17 obras:
 * 16 de 17 documentos tienen imagenPortada apuntando al placeholder
 * genérico ("duende-p.webp") en vez de a la imagen real de cada obra.
 * El valor correcto ya existe en imagenes[0].src de cada documento —
 * este script solo lo copia al campo imagenPortada cuando difieren.
 *
 * Uso: node scripts/corregirImagenPortada.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Obra = require('../models/Obra');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const obras = await Obra.find();
  let corregidas = 0;

  for (const obra of obras) {
    const imagenReal = obra.imagenes[0]?.src;
    if (imagenReal && obra.imagenPortada !== imagenReal) {
      obra.imagenPortada = imagenReal;
      await obra.save();
      corregidas++;
      console.log(`Corregida: ${obra.titulo}`);
    }
  }

  console.log(`\nListo. ${corregidas} de ${obras.length} obras corregidas.`);
  await mongoose.disconnect();
}

main();
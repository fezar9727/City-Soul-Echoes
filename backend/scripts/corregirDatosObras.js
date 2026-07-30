/**
 * corregirDatosObras.js
 *
 * Corrige dos cosas puntuales detectadas al comparar el HTML original
 * contra los datos actuales en MongoDB:
 * 1. La descripcion de "Duende Yoguista I" quedó incompleta al cargarse.
 * 2. Los precios reales de las 17 obras, ajustados según complejidad
 *    de elaboración (tiempo de diseño, estructura, acabado) y revisados
 *    en una segunda pasada para reflejar mejor el valor de mercado.
 *
 * Pendiente para después de la entrega del 15: evaluar unificar los
 * pares de obras que son la misma pieza física fotografiada dos veces
 * (Yoguista I/II, Suerte I/II, Vacío I/II, Elefante I/II, Señor de la
 * Noche I/II) en un solo documento con array de imágenes.
 *
 * Uso: node scripts/corregirDatosObras.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Obra = require('../models/Obra');

const PRECIOS_REALES = {
  'Duende Yoguista I': 320000,
  'Duende Yoguista II': 320000,
  'Duende de la Suerte I': 230000,
  'Duende de la Suerte II': 230000,
  'Duende Flautista': 200000,
  'Duende Demonio': 310000,
  'Duende Yoguista III': 220000,
  'Vacío Interior I': 300000,
  'Vacío Interior II': 300000,
  'Dragón Europeo': 290000,
  'Elefante de la Abundancia I': 270000,
  'Elefante de la Abundancia II': 270000,
  'El Espantapájaros': 310000,
  'El Señor de la Noche I': 250000,
  'El Señor de la Noche II': 250000,
  'Antología Fantástica I': 420000,
  'Antología Fantástica II': 550000
};

const DESCRIPCION_CORREGIDA_YOGUISTA_I =
  'Escultura sobre base reciclada con estructura interna de alambre. ' +
  'El duende meditando fusiona la mitología elemental con el equilibrio ' +
  'espiritual del yoga, modelado íntegramente a mano en porcelanicrón.';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const obras = await Obra.find();
  let actualizadas = 0;

  for (const obra of obras) {
    let cambio = false;

    const precioReal = PRECIOS_REALES[obra.titulo];
    if (precioReal !== undefined && obra.precio !== precioReal) {
      obra.precio = precioReal;
      cambio = true;
    }

    if (obra.titulo === 'Duende Yoguista I' && obra.descripcion !== DESCRIPCION_CORREGIDA_YOGUISTA_I) {
      obra.descripcion = DESCRIPCION_CORREGIDA_YOGUISTA_I;
      cambio = true;
    }

    if (cambio) {
      await obra.save();
      actualizadas++;
      console.log(`Actualizada: ${obra.titulo}`);
    }
  }

  console.log(`\nListo. ${actualizadas} de ${obras.length} obras actualizadas.`);
  await mongoose.disconnect();
}

main();
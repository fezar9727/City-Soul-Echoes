/**
 * verificarFirmaWompi.js
 *
 * Verifica que un webhook recibido realmente proviene de Wompi y no fue
 * falsificado ni alterado en transito.
 *
 * Como funciona la firma de Wompi:
 * Wompi envia en el body del webhook un objeto "signature" con:
 *   - properties: lista de campos que se usaron para calcular el checksum
 *     (ej: ["transaction.id", "transaction.status", "transaction.amount_in_cents"])
 *   - checksum: el hash SHA256 resultante
 * Ademas envia un campo "timestamp" en el body.
 *
 * Para verificar: se toman los valores de esos "properties" en el mismo orden,
 * se concatenan junto con el timestamp y el WOMPI_EVENTS_SECRET, y se calcula
 * un SHA256. Si coincide con el checksum recibido, el webhook es legitimo.
 *
 * Se usa crypto.timingSafeEqual en vez de comparar strings con === para
 * evitar ataques de timing (una tecnica donde un atacante puede inferir
 * un secreto midiendo cuanto tarda una comparacion de strings).
 */

const crypto = require('crypto');

function obtenerValorPorRuta(objeto, ruta) {
  return ruta.split('.').reduce((actual, clave) => (actual ? actual[clave] : undefined), objeto);
}

function verificarFirmaWompi(body) {
  const { signature, timestamp, data } = body;

  if (!signature || !signature.checksum || !signature.properties || !timestamp) {
    return false;
  }

  const secreto = process.env.WOMPI_EVENTS_SECRET;
  if (!secreto) {
    return false;
  }

  const valoresConcatenados = signature.properties
    .map((ruta) => obtenerValorPorRuta(data, ruta))
    .join('');

  const cadenaAFirmar = `${valoresConcatenados}${timestamp}${secreto}`;
  const checksumCalculado = crypto.createHash('sha256').update(cadenaAFirmar).digest('hex').toUpperCase();

  const checksumRecibido = signature.checksum.toUpperCase();

  const bufferCalculado = Buffer.from(checksumCalculado);
  const bufferRecibido = Buffer.from(checksumRecibido);

  if (bufferCalculado.length !== bufferRecibido.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferCalculado, bufferRecibido);
}

module.exports = verificarFirmaWompi;
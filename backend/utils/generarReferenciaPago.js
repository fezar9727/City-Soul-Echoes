/**
 * generarReferenciaPago.js
 *
 * Genera una referencia unica para identificar cada pago ante Wompi.
 * Centralizado aca porque tanto pago.controller.js como
 * solicitudVendedor.controller.js necesitan generar referencias.
 */

const crypto = require('crypto');

function generarReferenciaPago() {
  return `CSE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

module.exports = generarReferenciaPago;
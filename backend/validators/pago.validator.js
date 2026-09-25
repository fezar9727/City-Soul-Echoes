const { body } = require('express-validator');

// Valida solo la ESTRUCTURA del pedido de pago — el monto real nunca se
// confía desde aquí (el precio se calcula en el servidor a partir de
// conceptoId, no se acepta el campo "monto" del cliente, que es
// falsificable con herramientas como Postman o las DevTools del navegador).
const validarIniciarPago = [
  body('concepto')
    .trim()
    .notEmpty()
    .withMessage('El concepto es obligatorio')
    .isIn(['producto', 'suscripcion', 'actualizacion_plan'])
    .withMessage('Concepto no válido'),
  body('conceptoId')
    .notEmpty()
    .withMessage('conceptoId es obligatorio')
    .isMongoId()
    .withMessage('conceptoId no tiene un formato válido')
];

module.exports = { validarIniciarPago };
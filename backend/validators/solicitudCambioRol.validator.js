const { body } = require('express-validator');

const validarCrearSolicitud = [
    body('rolSolicitado')
        .notEmpty()
        .withMessage('El rol solicitado es obligatorio')
        .isIn(['usuario', 'artista', 'docente'])
        .withMessage('Rol no válido. Debe ser: usuario, artista o docente')
];

const validarRechazarSolicitud = [
    body('motivoRechazo')
        .optional({ checkFalsy: true })
        .isLength({ max: 300 })
        .withMessage('El motivo de rechazo no puede superar los 300 caracteres')
];

module.exports = { validarCrearSolicitud, validarRechazarSolicitud };
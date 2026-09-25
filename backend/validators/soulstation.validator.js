const { body } = require('express-validator');

const validarPista = (prefijo) => [
    body(`${prefijo}.titulo`).trim().notEmpty().withMessage('El título de la pista es obligatorio'),
    body(`${prefijo}.url`).trim().notEmpty().withMessage('La URL de la pista es obligatoria').isURL().withMessage('La URL de la pista no es válida'),
    body(`${prefijo}.orden`).isInt({ min: 0 }).withMessage('El orden debe ser un número entero mayor o igual a 0')
];

const validarCrearEstacion = [
    body('nombre')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre no puede superar los 100 caracteres'),
    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres'),
    body('playlist')
        .optional()
        .isArray()
        .withMessage('La playlist debe ser un arreglo de pistas'),
    body('playlist.*.titulo')
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage('Cada pista de la playlist necesita un título'),
    body('playlist.*.url')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('Cada pista de la playlist necesita una URL válida')
];

const validarActualizarEstacion = [
    body('nombre').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
    body('descripcion').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
    body('playlist').optional().isArray().withMessage('La playlist debe ser un arreglo de pistas'),
    body('playlist.*.titulo').optional({ checkFalsy: true }).trim().notEmpty().withMessage('Cada pista de la playlist necesita un título'),
    body('playlist.*.url').optional({ checkFalsy: true }).isURL().withMessage('Cada pista de la playlist necesita una URL válida'),
    body('enVivo').optional().isBoolean().withMessage('enVivo debe ser verdadero o falso'),
    body('linkTransmision').optional({ checkFalsy: true }).isURL().withMessage('El link de transmisión debe ser una URL válida')
];

const validarToggleEnVivo = [
    body('linkTransmision')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El link de transmisión debe ser una URL válida')
];

const validarActualizarPista = [
    body('pistaActual')
        .notEmpty()
        .withMessage('pistaActual es obligatorio')
        .isInt({ min: 0 })
        .withMessage('pistaActual debe ser un número entero mayor o igual a 0')
];

module.exports = { validarCrearEstacion, validarActualizarEstacion, validarToggleEnVivo, validarActualizarPista };
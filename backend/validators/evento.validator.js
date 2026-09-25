const { body } = require('express-validator');

const TIPOS_VALIDOS = ['evento', 'viernes-cultural'];

const validarCrearEvento = [
    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El título es obligatorio')
        .isLength({ max: 150 })
        .withMessage('El título no puede superar los 150 caracteres'),
    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede superar los 1000 caracteres'),
    body('tipo')
        .notEmpty()
        .withMessage('El tipo de evento es obligatorio')
        .isIn(TIPOS_VALIDOS)
        .withMessage('Tipo de evento no válido'),
    body('fecha')
        .notEmpty()
        .withMessage('La fecha es obligatoria')
        .isISO8601()
        .withMessage('La fecha no tiene un formato válido'),
    body('hora')
        .optional({ checkFalsy: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('La hora debe tener formato HH:MM (24 horas)'),
    body('linkSala')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El link de la sala debe ser una URL válida'),
    body('accesoPúblico')
        .optional()
        .isBoolean()
        .withMessage('accesoPúblico debe ser verdadero o falso'),
    body('cupos')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('Los cupos deben ser un número entero mayor o igual a 0')
];

const validarActualizarEvento = [
    body('titulo').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage('El título no puede superar los 150 caracteres'),
    body('descripcion').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('La descripción no puede superar los 1000 caracteres'),
    body('tipo').optional({ checkFalsy: true }).isIn(TIPOS_VALIDOS).withMessage('Tipo de evento no válido'),
    body('fecha').optional({ checkFalsy: true }).isISO8601().withMessage('La fecha no tiene un formato válido'),
    body('hora').optional({ checkFalsy: true }).matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('La hora debe tener formato HH:MM (24 horas)'),
    body('linkSala').optional({ checkFalsy: true }).isURL().withMessage('El link de la sala debe ser una URL válida'),
    body('accesoPúblico').optional().isBoolean().withMessage('accesoPúblico debe ser verdadero o falso'),
    body('cupos').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Los cupos deben ser un número entero mayor o igual a 0'),
    body('activo').optional().isBoolean().withMessage('activo debe ser verdadero o falso')
];

const validarModerarEvento = [
    body('decision')
        .notEmpty()
        .withMessage('La decisión es obligatoria')
        .isIn(['aprobado', 'rechazado'])
        .withMessage('Decisión inválida, debe ser aprobado o rechazado'),
    body('motivoRechazo')
        .optional({ checkFalsy: true })
        .isLength({ max: 300 })
        .withMessage('El motivo de rechazo no puede superar los 300 caracteres')
];

module.exports = { validarCrearEvento, validarActualizarEvento, validarModerarEvento };
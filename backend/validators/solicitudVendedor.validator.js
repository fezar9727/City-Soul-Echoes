const { body } = require('express-validator');

// Mismas categorías reales del modelo SolicitudVendedor.js — se
// replican acá para que express-validator rechace el pedido ANTES de
// llegar a Mongoose, dando un mensaje de error más claro al usuario
// que el genérico de validación de Mongo.
const CATEGORIAS_VALIDAS = ['artesania', 'escultura', 'pintura', 'fotografia', 'digital', 'musica', 'otro'];

const validarCrearSolicitud = [
    body('descripcionProductos')
        .trim()
        .notEmpty()
        .withMessage('Debés describir qué productos querés vender')
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(CATEGORIAS_VALIDAS)
        .withMessage('Categoría no válida'),
    body('aceptaTerminos')
        .notEmpty()
        .withMessage('Debés aceptar los términos de venta')
        .isBoolean()
        .withMessage('aceptaTerminos debe ser verdadero o falso')
        .custom((valor) => valor === true || valor === 'true')
        .withMessage('Debés aceptar los términos de venta para continuar'),
    body('datosPago.nequi')
        .optional({ checkFalsy: true })
        .isMobilePhone('es-CO')
        .withMessage('El número de Nequi no es válido para Colombia'),
    body('datosPago.llavePublicaWompi')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('La llave pública de Wompi debe ser texto')
];

const validarRechazarSolicitud = [
    body('motivoRechazo')
        .optional({ checkFalsy: true })
        .isLength({ max: 300 })
        .withMessage('El motivo de rechazo no puede superar los 300 caracteres')
];

module.exports = { validarCrearSolicitud, validarRechazarSolicitud };
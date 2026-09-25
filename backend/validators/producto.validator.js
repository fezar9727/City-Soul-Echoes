const { body } = require('express-validator');

const CATEGORIAS_VALIDAS = ['artesania', 'escultura', 'pintura', 'fotografia', 'digital', 'musica', 'otro'];

const reglasComunes = [
    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El título es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El título no puede superar los 100 caracteres'),
    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede superar los 1000 caracteres'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor o igual a 0'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(CATEGORIAS_VALIDAS)
        .withMessage('Categoría no válida'),
    body('stock')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('imagenes')
        .optional()
        .isArray()
        .withMessage('imagenes debe ser un arreglo de URLs')
];

const validarCrearProducto = reglasComunes;

// En edición, todos los campos son opcionales (PATCH parcial real) —
// pero SI vienen, deben cumplir las mismas reglas que en la creación.
const validarActualizarProducto = [
    body('titulo').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('El título no puede superar los 100 caracteres'),
    body('descripcion').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('La descripción no puede superar los 1000 caracteres'),
    body('precio').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
    body('categoria').optional({ checkFalsy: true }).isIn(CATEGORIAS_VALIDAS).withMessage('Categoría no válida'),
    body('stock').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('disponible').optional().isBoolean().withMessage('disponible debe ser verdadero o falso'),
    body('imagenes').optional().isArray().withMessage('imagenes debe ser un arreglo de URLs')
];

module.exports = { validarCrearProducto, validarActualizarProducto };
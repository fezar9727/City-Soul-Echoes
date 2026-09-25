const { body } = require('express-validator');

// Categorías reales según models/Obra.js — distintas de las de
// Producto.js (esa incluye "artesania", esta no la tiene).
const CATEGORIAS_VALIDAS = ['pintura', 'escultura', 'musica', 'digital', 'fotografia', 'otro'];

const validarCrearObra = [
    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El título es obligatorio')
        .isLength({ max: 150 })
        .withMessage('El título no puede superar los 150 caracteres'),
    body('tituloEn')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage('El título en inglés no puede superar los 150 caracteres'),
    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede superar los 1000 caracteres'),
    body('serie')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('La serie no puede superar los 100 caracteres'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 1 })
        .withMessage('El precio debe ser mayor a 0'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(CATEGORIAS_VALIDAS)
        .withMessage('Categoría no válida'),
    body('enVenta')
        .optional()
        .isBoolean()
        .withMessage('enVenta debe ser verdadero o falso')
];

// Edición: todos opcionales (PATCH parcial real), pero si vienen deben
// cumplir las mismas reglas que en la creación.
const validarActualizarObra = [
    body('titulo').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage('El título no puede superar los 150 caracteres'),
    body('tituloEn').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage('El título en inglés no puede superar los 150 caracteres'),
    body('descripcion').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('La descripción no puede superar los 1000 caracteres'),
    body('serie').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('La serie no puede superar los 100 caracteres'),
    body('precio').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage('El precio debe ser mayor a 0'),
    body('categoria').optional({ checkFalsy: true }).isIn(CATEGORIAS_VALIDAS).withMessage('Categoría no válida'),
    body('enVenta').optional().isBoolean().withMessage('enVenta debe ser verdadero o falso'),
    body('disponible').optional().isBoolean().withMessage('disponible debe ser verdadero o falso')
];

module.exports = { validarCrearObra, validarActualizarObra };
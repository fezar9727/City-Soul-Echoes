const { body } = require('express-validator');

const TIPOS_VALIDOS = ['comunidad', 'muro-artistas'];

const validarCrearPublicacion = [
    body('contenido')
        .trim()
        .notEmpty()
        .withMessage('El contenido es obligatorio')
        .isLength({ max: 2000 })
        .withMessage('La publicación no puede superar los 2000 caracteres'),
    body('tipo')
        .notEmpty()
        .withMessage('El tipo de publicación es obligatorio')
        .isIn(TIPOS_VALIDOS)
        .withMessage('Tipo de publicación no válido'),
    body('imagenes')
        .optional()
        .isArray()
        .withMessage('imagenes debe ser un arreglo de URLs')
];

const validarComentario = [
    body('contenido')
        .trim()
        .notEmpty()
        .withMessage('El comentario es obligatorio')
        .isLength({ max: 500 })
        .withMessage('El comentario no puede superar los 500 caracteres')
];

module.exports = { validarCrearPublicacion, validarComentario };
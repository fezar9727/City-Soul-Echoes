const { body } = require('express-validator');

const CATEGORIAS_VALIDAS = ['arte', 'escultura', 'musica', 'digital', 'fotografia', 'emprendimiento', 'bienestar', 'otro'];
const MODALIDADES_VALIDAS = ['virtual', 'presencial', 'mixta'];

// lecciones llega como STRING JSON (multipart/form-data no soporta
// arrays anidados directo) — se valida que sea un JSON parseable y
// que sea un array ANTES de llegar al controlador, dando un error 400
// claro en vez de que un JSON.parse roto termine en un 500 genérico.
const validarLeccionesJSON = body('lecciones')
    .optional({ checkFalsy: true })
    .custom((valor) => {
        try {
            const parseado = JSON.parse(valor);
            if (!Array.isArray(parseado)) throw new Error();
            return true;
        } catch {
            throw new Error('El formato de lecciones no es un JSON de arreglo válido');
        }
    });

const validarCrearCurso = [
    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El título es obligatorio')
        .isLength({ max: 150 })
        .withMessage('El título no puede superar los 150 caracteres'),
    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage('La descripción no puede superar los 2000 caracteres'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(CATEGORIAS_VALIDAS)
        .withMessage('Categoría no válida'),
    body('modalidad')
        .optional({ checkFalsy: true })
        .isIn(MODALIDADES_VALIDAS)
        .withMessage('Modalidad no válida'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio no puede ser negativo'),
    body('duracionHoras')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('La duración debe ser un número mayor o igual a 0'),
    validarLeccionesJSON
];

const validarActualizarCurso = [
    body('titulo').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage('El título no puede superar los 150 caracteres'),
    body('descripcion').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('La descripción no puede superar los 2000 caracteres'),
    body('categoria').optional({ checkFalsy: true }).isIn(CATEGORIAS_VALIDAS).withMessage('Categoría no válida'),
    body('modalidad').optional({ checkFalsy: true }).isIn(MODALIDADES_VALIDAS).withMessage('Modalidad no válida'),
    body('precio').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
    body('duracionHoras').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('La duración debe ser un número mayor o igual a 0'),
    validarLeccionesJSON
];

module.exports = { validarCrearCurso, validarActualizarCurso };
const { body } = require('express-validator');

const validarRegistroUsuario = [
    body('nombreCompleto')
        .trim()
        .notEmpty()
        .withMessage('El nombre completo es obligatorio'),
    body('correo')
        .isEmail()
        .withMessage('El correo no tiene un formato válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('telefono')
        .optional({ checkFalsy: true })
        .isMobilePhone('es-CO')
        .withMessage('El teléfono no es válido para Colombia')
];

const validarRegistroArtista = [
    ...validarRegistroUsuario,
    body('perfilArtista.nombreArtistico')
        .trim()
        .notEmpty()
        .withMessage('El nombre artístico es obligatorio'),
    body('perfilArtista.disciplinas')
        .isArray({ min: 1 })
        .withMessage('Debes seleccionar al menos una disciplina'),
    body('perfilArtista.disciplinas.*')
        .isIn(['pintura', 'escultura', 'musica', 'digital', 'fotografia', 'otro'])
        .withMessage('Disciplina no válida')
];

const validarRegistroDocente = [
    ...validarRegistroUsuario,
    body('perfilDocente.nombrePublico')
        .trim()
        .notEmpty()
        .withMessage('El nombre público es obligatorio'),
    body('perfilDocente.especialidad')
        .trim()
        .notEmpty()
        .withMessage('La especialidad es obligatoria'),
    body('perfilDocente.modalidad')
        .optional()
        .isIn(['virtual', 'presencial', 'mixta'])
        .withMessage('La modalidad debe ser: virtual, presencial o mixta')
];

const validarLogin = [
    body('correo')
        .isEmail()
        .withMessage('El correo no tiene un formato válido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
];

module.exports = {
    validarRegistroUsuario,
    validarRegistroArtista,
    validarRegistroDocente,
    validarLogin
};
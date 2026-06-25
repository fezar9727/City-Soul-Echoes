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
        .withMessage('Disciplina no válida'),

    body('perfilArtista.redes.instagram')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El Instagram del artista debe ser una URL válida'),

    body('perfilArtista.redes.tiktok')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El TikTok del artista debe ser una URL válida'),

    body('perfilArtista.redes.facebook')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El Facebook del artista debe ser una URL válida'),

    body('perfilArtista.redes.portafolioExterno')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El portafolio externo del artista debe ser una URL válida'),
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
        .withMessage('La modalidad debe ser: virtual, presencial o mixta'),

    body('perfilDocente.redes.instagram')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El Instagram del docente debe ser una URL válida'),

    body('perfilDocente.redes.tiktok')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El TikTok del docente debe ser una URL válida'),

    body('perfilDocente.redes.facebook')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El Facebook del docente debe ser una URL válida'),

    body('perfilDocente.redes.portafolioExterno')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('El portafolio externo del docente debe ser una URL válida'),
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
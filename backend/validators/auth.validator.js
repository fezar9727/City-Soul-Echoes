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
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe incluir al menos una minúscula')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe incluir al menos una mayúscula')
        .matches(/\d/)
        .withMessage('La contraseña debe incluir al menos un número')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('La contraseña debe incluir al menos un carácter especial'),
    body('telefono')
        .optional({ checkFalsy: true })
        .isMobilePhone('es-CO')
        .withMessage('El teléfono no es válido para Colombia'),
    body('ciudad')
        .optional({ checkFalsy: true })
        .isIn([
            'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga',
            'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'El Cerrito',
            'Ginebra', 'Guacarí', 'San Pedro', 'Andalucía', 'Bugalagrande',
            'Zarzal', 'La Victoria', 'Roldanillo', 'La Unión', 'Toro', 'Ansermanuevo',
            'Ulloa', 'Alcalá', 'Sevilla', 'Caicedonia', 'Trujillo',
            'Riofrío', 'Restrepo', 'Vijes', 'Dagua', 'La Cumbre', 'Yotoco',
            'Calima (Darién)', 'Argelia', 'El Águila', 'El Cairo', 'Versalles',
            'El Dovio', 'Obando'
        ])
        .withMessage('Selecciona un municipio del Valle del Cauca')
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
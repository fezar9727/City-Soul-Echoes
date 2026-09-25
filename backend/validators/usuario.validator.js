const { body } = require('express-validator');

const CIUDADES_VALLE = [
    'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga',
    'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'El Cerrito',
    'Ginebra', 'Guacarí', 'San Pedro', 'Andalucía', 'Bugalagrande',
    'Zarzal', 'La Victoria', 'Roldanillo', 'La Unión', 'Toro', 'Ansermanuevo',
    'Ulloa', 'Alcalá', 'Sevilla', 'Caicedonia', 'Trujillo',
    'Riofrío', 'Restrepo', 'Vijes', 'Dagua', 'La Cumbre', 'Yotoco',
    'Calima (Darién)', 'Argelia', 'El Águila', 'El Cairo', 'Versalles',
    'El Dovio', 'Obando'
];

// Regla real de contraseña fuerte — misma exigencia que en el registro
// (auth.validator.js), para que resetear/cambiar contraseña no sea más
// débil que crear la cuenta.
const reglasPasswordFuerte = (campo) => body(campo)
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe incluir al menos una minúscula')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe incluir al menos una mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir al menos un número')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('La contraseña debe incluir al menos un carácter especial');

const validarActualizarPerfil = [
    body('nombreCompleto')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre completo debe tener entre 2 y 100 caracteres'),
    body('telefono')
        .optional({ checkFalsy: true })
        .isMobilePhone('es-CO')
        .withMessage('El teléfono no es válido para Colombia'),
    body('ciudad')
        .optional({ checkFalsy: true })
        .isIn(CIUDADES_VALLE)
        .withMessage('Selecciona un municipio del Valle del Cauca'),
    body('bio')
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('La bio no puede superar los 500 caracteres')
];

const validarCambiarPassword = [
    body('passwordActual')
        .notEmpty()
        .withMessage('Debés indicar tu contraseña actual'),
    reglasPasswordFuerte('passwordNueva')
];

const validarCambiarRol = [
    body('nuevoRol')
        .notEmpty()
        .withMessage('El nuevo rol es obligatorio')
        .isIn(['usuario', 'artista', 'docente'])
        .withMessage('Rol no válido. Debe ser: usuario, artista o docente')
];

const validarForgotPassword = [
    body('correo')
        .isEmail()
        .withMessage('El correo no tiene un formato válido')
        .normalizeEmail()
];

const validarResetPassword = [
    body('token')
        .notEmpty()
        .withMessage('El token es obligatorio'),
    reglasPasswordFuerte('nuevaPassword')
];

const validarVerificarCorreo = [
    body('token')
        .notEmpty()
        .withMessage('El token es obligatorio')
];

module.exports = {
    validarActualizarPerfil,
    validarCambiarPassword,
    validarCambiarRol,
    validarForgotPassword,
    validarResetPassword,
    validarVerificarCorreo
};
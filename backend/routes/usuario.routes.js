const express = require('express');
const router = express.Router();
const protegerRuta = require('../middlewares/auth.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const uploadAvatar = crearUploadMiddleware('avatares');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const {
    validarActualizarPerfil,
    validarCambiarPassword,
    validarCambiarRol,
    validarForgotPassword,
    validarResetPassword,
    validarVerificarCorreo
} = require('../validators/usuario.validator');
const {
    actualizarPerfil,
    cambiarPassword,
    cambiarRol,
    forgotPassword,
    resetPassword,
    verificarCorreo,
    obtenerPerfilPublico
} = require('../controllers/usuario.controller');

router.get('/perfil/:id', obtenerPerfilPublico);
router.put('/perfil', protegerRuta, uploadAvatar.single('avatar'), validarActualizarPerfil, manejarErroresValidacion, actualizarPerfil);
router.patch('/cambiar-password', protegerRuta, validarCambiarPassword, manejarErroresValidacion, cambiarPassword);
router.patch('/cambiar-rol', protegerRuta, validarCambiarRol, manejarErroresValidacion, cambiarRol);
router.post('/recuperar-password', validarForgotPassword, manejarErroresValidacion, forgotPassword);
router.post('/resetear-password', validarResetPassword, manejarErroresValidacion, resetPassword);
router.post('/verificar-correo', validarVerificarCorreo, manejarErroresValidacion, verificarCorreo);

module.exports = router;
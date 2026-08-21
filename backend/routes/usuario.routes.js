const express = require('express');
const router = express.Router();
const protegerRuta = require('../middlewares/auth.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const uploadAvatar = crearUploadMiddleware('avatares');
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
router.put('/perfil', protegerRuta, uploadAvatar.single('avatar'), actualizarPerfil);
router.patch('/cambiar-password', protegerRuta, cambiarPassword);
router.patch('/cambiar-rol', protegerRuta, cambiarRol);
router.post('/recuperar-password', forgotPassword);
router.post('/resetear-password', resetPassword);
router.post('/verificar-correo', verificarCorreo);

module.exports = router;
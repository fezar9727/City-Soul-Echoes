const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const {
    actualizarPerfil,
    cambiarRol,
    forgotPassword,
    resetPassword,
    verificarCorreo
} = require('../controllers/usuario.controller');

router.put('/perfil', protegerRuta, actualizarPerfil);
router.patch('/cambiar-rol', protegerRuta, cambiarRol);
router.post('/recuperar-password', forgotPassword);
router.post('/resetear-password', resetPassword);
router.post('/verificar-correo', verificarCorreo);

module.exports = router;
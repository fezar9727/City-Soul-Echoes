const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    obtenerEstacion,
    crearEstacion,
    actualizarEstacion,
    toggleEnVivo,
    actualizarPistaActual
} = require('../controllers/soulstation.controller');

router.get('/', obtenerEstacion);
router.post('/', protegerRuta, verificarRol('admin'), crearEstacion);
router.put('/', protegerRuta, verificarRol('admin'), actualizarEstacion);
router.patch('/envivo', protegerRuta, verificarRol('admin'), toggleEnVivo);
router.patch('/pista', protegerRuta, verificarRol('admin'), actualizarPistaActual);

module.exports = router;
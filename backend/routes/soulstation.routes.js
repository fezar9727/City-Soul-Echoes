const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const {
    validarCrearEstacion,
    validarActualizarEstacion,
    validarToggleEnVivo,
    validarActualizarPista
} = require('../validators/soulstation.validator');
const {
    obtenerEstacion,
    crearEstacion,
    actualizarEstacion,
    toggleEnVivo,
    actualizarPistaActual
} = require('../controllers/soulstation.controller');

router.get('/', obtenerEstacion);
router.post('/', protegerRuta, verificarRol('admin'), validarCrearEstacion, manejarErroresValidacion, crearEstacion);
router.put('/', protegerRuta, verificarRol('admin'), validarActualizarEstacion, manejarErroresValidacion, actualizarEstacion);
router.patch('/envivo', protegerRuta, verificarRol('admin'), validarToggleEnVivo, manejarErroresValidacion, toggleEnVivo);
router.patch('/pista', protegerRuta, verificarRol('admin'), validarActualizarPista, manejarErroresValidacion, actualizarPistaActual);

module.exports = router;
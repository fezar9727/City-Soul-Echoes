const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    crearEvento,
    obtenerEventos,
    obtenerEvento,
    actualizarEvento,
    eliminarEvento,
    obtenerViernesCulturales
} = require('../controllers/evento.controller');

router.get('/', obtenerEventos);
router.get('/viernes-culturales', obtenerViernesCulturales);
router.get('/:id', obtenerEvento);
router.post('/', protegerRuta, verificarRol('admin'), crearEvento);
router.put('/:id', protegerRuta, verificarRol('admin'), actualizarEvento);
router.delete('/:id', protegerRuta, verificarRol('admin'), eliminarEvento);

module.exports = router;
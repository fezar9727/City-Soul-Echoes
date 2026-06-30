const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    crearObra,
    obtenerObras,
    obtenerObra,
    actualizarObra,
    eliminarObra,
    obtenerObrasPropiasAdmin
} = require('../controllers/obra.controller');

router.get('/', obtenerObras);
router.get('/mis-obras', protegerRuta, obtenerObrasPropiasAdmin);
router.get('/:id', obtenerObra);
router.post('/', protegerRuta, verificarRol('artista', 'admin'), crearObra);
router.put('/:id', protegerRuta, verificarRol('artista', 'admin'), actualizarObra);
router.delete('/:id', protegerRuta, verificarRol('artista', 'admin'), eliminarObra);

module.exports = router;
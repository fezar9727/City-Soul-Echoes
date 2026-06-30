const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.post('/', protegerRuta, verificarRol('artista', 'docente', 'admin'), crearProducto);
router.put('/:id', protegerRuta, verificarRol('artista', 'docente', 'admin'), actualizarProducto);
router.delete('/:id', protegerRuta, verificarRol('artista', 'docente', 'admin'), eliminarProducto);

module.exports = router;
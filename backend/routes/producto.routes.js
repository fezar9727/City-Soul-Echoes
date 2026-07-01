const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const verificarVendedor = require('../middlewares/vendedor.middleware');
const {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.post('/', protegerRuta, verificarVendedor, crearProducto);
router.put('/:id', protegerRuta, verificarVendedor, actualizarProducto);
router.delete('/:id', protegerRuta, verificarVendedor, eliminarProducto);

module.exports = router;
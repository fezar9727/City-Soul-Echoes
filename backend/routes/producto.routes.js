const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const verificarVendedor = require('../middlewares/vendedor.middleware');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const { validarCrearProducto, validarActualizarProducto } = require('../validators/producto.validator');
const {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.post('/', protegerRuta, verificarVendedor, validarCrearProducto, manejarErroresValidacion, crearProducto);
router.put('/:id', protegerRuta, verificarVendedor, validarActualizarProducto, manejarErroresValidacion, actualizarProducto);
router.delete('/:id', protegerRuta, verificarVendedor, eliminarProducto);

module.exports = router;
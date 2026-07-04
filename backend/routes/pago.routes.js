const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    iniciarPago,
    webhookWompi,
    obtenerMisPagos,
    obtenerTodosLosPagos,
    obtenerMiSuscripcion
} = require('../controllers/pago.controller');

router.post('/webhook', webhookWompi);
router.post('/iniciar', protegerRuta, iniciarPago);
router.get('/mis-pagos', protegerRuta, obtenerMisPagos);
router.get('/mi-suscripcion', protegerRuta, obtenerMiSuscripcion);
router.get('/todos', protegerRuta, verificarRol('admin'), obtenerTodosLosPagos);

module.exports = router;
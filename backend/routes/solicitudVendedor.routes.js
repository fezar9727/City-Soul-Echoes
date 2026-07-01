const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    crearSolicitud,
    obtenerSolicitudes,
    obtenerMiSolicitud,
    aprobarSolicitud,
    rechazarSolicitud
} = require('../controllers/solicitudVendedor.controller');

router.post('/', protegerRuta, crearSolicitud);
router.get('/mi-solicitud', protegerRuta, obtenerMiSolicitud);
router.get('/', protegerRuta, verificarRol('admin'), obtenerSolicitudes);
router.patch('/:id/aprobar', protegerRuta, verificarRol('admin'), aprobarSolicitud);
router.patch('/:id/rechazar', protegerRuta, verificarRol('admin'), rechazarSolicitud);

module.exports = router;
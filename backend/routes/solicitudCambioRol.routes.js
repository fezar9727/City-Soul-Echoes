const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const { validarCrearSolicitud, validarRechazarSolicitud } = require('../validators/solicitudCambioRol.validator');
const {
    crearSolicitud,
    obtenerSolicitudes,
    obtenerMiSolicitud,
    aprobarSolicitud,
    rechazarSolicitud
} = require('../controllers/solicitudCambioRol.controller');

router.post('/', protegerRuta, validarCrearSolicitud, manejarErroresValidacion, crearSolicitud);
router.get('/mia', protegerRuta, obtenerMiSolicitud);
router.get('/', protegerRuta, verificarRol('admin'), obtenerSolicitudes);
router.patch('/:id/aprobar', protegerRuta, verificarRol('admin'), aprobarSolicitud);
router.patch('/:id/rechazar', protegerRuta, verificarRol('admin'), validarRechazarSolicitud, manejarErroresValidacion, rechazarSolicitud);

module.exports = router;
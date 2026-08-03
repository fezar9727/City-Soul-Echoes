const express = require('express');
const router = express.Router();
const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const {
    crearEvento,
    obtenerEventos,
    obtenerEvento,
    actualizarEvento,
    eliminarEvento,
    obtenerPapelera,
    restaurarEvento,
    eliminarDefinitivo,
    obtenerViernesCulturales,
    obtenerPendientesModeracion,
    moderarEvento
} = require('../controllers/evento.controller');

const uploadEvento = crearUploadMiddleware('eventos');

router.get('/', obtenerEventos);
router.get('/viernes-culturales', obtenerViernesCulturales);
router.get('/papelera', protegerRuta, verificarRol('admin'), obtenerPapelera);
router.get('/moderacion/pendientes', protegerRuta, verificarRol('admin'), obtenerPendientesModeracion);
router.get('/:id', obtenerEvento);
router.post('/', protegerRuta, uploadEvento.single('imagenPortada'), crearEvento);
router.put('/:id', protegerRuta, verificarRol('admin'), uploadEvento.single('imagenPortada'), actualizarEvento);
router.patch('/:id/restaurar', protegerRuta, verificarRol('admin'), restaurarEvento);
router.patch('/:id/moderar', protegerRuta, verificarRol('admin'), moderarEvento);
router.delete('/:id', protegerRuta, verificarRol('admin'), eliminarEvento);
router.delete('/:id/definitivo', protegerRuta, verificarRol('admin'), eliminarDefinitivo);

module.exports = router;
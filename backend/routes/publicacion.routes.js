const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const { validarCrearPublicacion, validarComentario } = require('../validators/publicacion.validator');
const {
    crearPublicacion,
    obtenerPublicaciones,
    obtenerPublicacion,
    eliminarPublicacion,
    darLike,
    agregarComentario
} = require('../controllers/publicacion.controller');

router.get('/', obtenerPublicaciones);
router.get('/:id', obtenerPublicacion);
router.post('/', protegerRuta, validarCrearPublicacion, manejarErroresValidacion, crearPublicacion);
router.delete('/:id', protegerRuta, eliminarPublicacion);
router.post('/:id/like', protegerRuta, darLike);
router.post('/:id/comentarios', protegerRuta, validarComentario, manejarErroresValidacion, agregarComentario);

module.exports = router;
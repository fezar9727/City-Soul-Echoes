const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
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
router.post('/', protegerRuta, crearPublicacion);
router.delete('/:id', protegerRuta, eliminarPublicacion);
router.post('/:id/like', protegerRuta, darLike);
router.post('/:id/comentarios', protegerRuta, agregarComentario);

module.exports = router;
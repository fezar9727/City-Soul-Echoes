const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const {
    crearObra,
    obtenerObras,
    obtenerObra,
    actualizarObra,
    eliminarObra,
    obtenerObrasPropiasAdmin,
    obtenerPapelera,
    restaurarObra,
    eliminarDefinitivo
} = require('../controllers/obra.controller');

const uploadObra = crearUploadMiddleware('obras');

// Ojo con el orden: las rutas específicas (mis-obras, papelera) van SIEMPRE
// antes de la ruta genérica /:id, o Express interpretaría "papelera" como un id.
router.get('/', obtenerObras);
router.get('/mis-obras', protegerRuta, obtenerObrasPropiasAdmin);
router.get('/papelera', protegerRuta, verificarRol('admin'), obtenerPapelera);
router.get('/:id', obtenerObra);
router.post('/', protegerRuta, verificarRol('artista', 'admin'), uploadObra.single('imagenPortada'), crearObra);
router.put('/:id', protegerRuta, verificarRol('artista', 'admin'), uploadObra.single('imagenPortada'), actualizarObra);
router.delete('/:id', protegerRuta, verificarRol('artista', 'admin'), eliminarObra);
router.patch('/:id/restaurar', protegerRuta, verificarRol('admin'), restaurarObra);
router.delete('/:id/definitivo', protegerRuta, verificarRol('admin'), eliminarDefinitivo);

module.exports = router;
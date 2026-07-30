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
    obtenerViernesCulturales
} = require('../controllers/evento.controller');

// Reutiliza la misma fábrica de Multer ya usada en Obras, con su propia
// carpeta de Cloudinary: city-soul-echoes/eventos
const uploadEvento = crearUploadMiddleware('eventos');

router.get('/', obtenerEventos);
router.get('/viernes-culturales', obtenerViernesCulturales);
router.get('/:id', obtenerEvento);
router.post('/', protegerRuta, verificarRol('admin'), uploadEvento.single('imagenPortada'), crearEvento);
router.put('/:id', protegerRuta, verificarRol('admin'), uploadEvento.single('imagenPortada'), actualizarEvento);
router.delete('/:id', protegerRuta, verificarRol('admin'), eliminarEvento);

module.exports = router;
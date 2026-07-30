const express = require('express');
const router = express.Router();
const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const {
    crearCurso,
    obtenerCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
    publicarCurso
} = require('../controllers/curso.controller');

// Reutiliza la misma fábrica de Multer ya usada en Obras y Eventos, con su
// propia carpeta de Cloudinary: city-soul-echoes/cursos
const uploadCurso = crearUploadMiddleware('cursos');

router.get('/', obtenerCursos);
router.get('/:id', obtenerCurso);
router.post('/', protegerRuta, verificarRol('docente', 'admin'), uploadCurso.single('imagenPortada'), crearCurso);
router.put('/:id', protegerRuta, verificarRol('docente', 'admin'), uploadCurso.single('imagenPortada'), actualizarCurso);
router.patch('/:id/publicar', protegerRuta, verificarRol('docente', 'admin'), publicarCurso);
router.delete('/:id', protegerRuta, verificarRol('docente', 'admin'), eliminarCurso);

module.exports = router;
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
    publicarCurso,
    obtenerPapelera,
    restaurarCurso,
    eliminarDefinitivo
} = require('../controllers/curso.controller');

const uploadCurso = crearUploadMiddleware('cursos');

router.get('/', obtenerCursos);
router.get('/papelera', protegerRuta, verificarRol('admin'), obtenerPapelera);
router.get('/:id', obtenerCurso);
router.post('/', protegerRuta, verificarRol('admin'), uploadCurso.single('imagenPortada'), crearCurso);
router.put('/:id', protegerRuta, verificarRol('admin'), uploadCurso.single('imagenPortada'), actualizarCurso);
router.patch('/:id/publicar', protegerRuta, verificarRol('admin'), publicarCurso);
router.patch('/:id/restaurar', protegerRuta, verificarRol('admin'), restaurarCurso);
router.delete('/:id', protegerRuta, verificarRol('admin'), eliminarCurso);
router.delete('/:id/definitivo', protegerRuta, verificarRol('admin'), eliminarDefinitivo);

module.exports = router;
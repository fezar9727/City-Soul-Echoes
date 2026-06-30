const express = require('express');
const router = express.Router();

const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const {
    crearCurso,
    obtenerCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
    publicarCurso
} = require('../controllers/curso.controller');

router.get('/', obtenerCursos);
router.get('/:id', obtenerCurso);
router.post('/', protegerRuta, verificarRol('docente', 'admin'), crearCurso);
router.put('/:id', protegerRuta, verificarRol('docente', 'admin'), actualizarCurso);
router.patch('/:id/publicar', protegerRuta, verificarRol('docente', 'admin'), publicarCurso);
router.delete('/:id', protegerRuta, verificarRol('docente', 'admin'), eliminarCurso);

module.exports = router;
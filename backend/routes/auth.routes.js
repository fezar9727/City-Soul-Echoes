const express = require('express');
const router = express.Router();

const { validarRegistroUsuario, validarRegistroArtista, validarRegistroDocente, validarLogin } = require('../validators/auth.validator');
const manejarErroresValidacion = require('../middlewares/validate.middleware');
const protegerRuta = require('../middlewares/auth.middleware');
const { registrarUsuario, registrarArtista, registrarDocente, login, obtenerPerfil } = require('../controllers/auth.controller');

router.post('/registro/usuario', validarRegistroUsuario, manejarErroresValidacion, registrarUsuario);
router.post('/registro/artista', validarRegistroArtista, manejarErroresValidacion, registrarArtista);
router.post('/registro/docente', validarRegistroDocente, manejarErroresValidacion, registrarDocente);
router.post('/login', validarLogin, manejarErroresValidacion, login);
router.get('/perfil', protegerRuta, obtenerPerfil);

module.exports = router;
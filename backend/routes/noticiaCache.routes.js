const express = require('express');
const router = express.Router();
const { obtenerNoticias } = require('../controllers/noticiaCache.controller');

// GET /api/noticias?categoria=noticias|cultura|videojuegos
// Ruta pública — cualquier visitante puede ver las noticias sin estar logueado
router.get('/', obtenerNoticias);

module.exports = router;
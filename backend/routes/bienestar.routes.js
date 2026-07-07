const express = require('express');
const router = express.Router();
const { obtenerBienestarPorCategoria } = require('../controllers/bienestar.controller');

// GET /api/bienestar?categoria=vegana|salud-mental|moda-inclusiva
// Ruta pública, sin token — igual que noticias, cualquier visitante puede verla
router.get('/', obtenerBienestarPorCategoria);

module.exports = router;
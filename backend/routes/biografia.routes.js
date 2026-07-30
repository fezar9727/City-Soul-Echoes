const express = require('express');
const router = express.Router();
const { obtenerBiografia } = require('../controllers/biografia.controller');

// Ruta pública — cualquier visitante puede ver la biografía
router.get('/', obtenerBiografia);

module.exports = router;
const express = require('express');
const router = express.Router();
const protegerRuta = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const verificarVendedor = require('../middlewares/vendedor.middleware');
const crearUploadMiddleware = require('../middlewares/upload.middleware');
const { subirImagen, subirMultiplesImagenes } = require('../controllers/imagen.controller');

// Un middleware de upload por carpeta — cada uno ya sabe a qué carpeta de Cloudinary ir
const uploadObras = crearUploadMiddleware('obras');
const uploadProductos = crearUploadMiddleware('productos');
const uploadCursos = crearUploadMiddleware('cursos');


// POST /api/imagenes/obras — solo artistas y admin pueden subir imágenes de obras
router.post(
    '/obras',
    protegerRuta,
    verificarRol('artista', 'admin'),
    uploadObras.single('imagen'),
    subirImagen
);

// POST /api/imagenes/obras/multiples — para subir varias fotos de una misma obra a la vez
router.post(
    '/obras/multiples',
    protegerRuta,
    verificarRol('artista', 'admin'),
    uploadObras.array('imagenes', 10),
    subirMultiplesImagenes
);

// POST /api/imagenes/productos — solo vendedores aprobados o admin
router.post(
    '/productos',
    protegerRuta,
    verificarVendedor,
    uploadProductos.single('imagen'),
    subirImagen
);

// POST /api/imagenes/cursos — solo docentes y admin pueden subir portadas de curso
router.post(
    '/cursos',
    protegerRuta,
    verificarRol('docente', 'admin'),
    uploadCursos.single('imagen'),
    subirImagen
);

module.exports = router;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2');
const cloudinary = require('../config/cloudinary');

// Genera un middleware de Multer configurado para una carpeta específica de Cloudinary
// Reutilizable — se llama con el nombre de carpeta que corresponda: obras, productos o cursos
const crearUploadMiddleware = (nombreCarpeta) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `city-soul-echoes/${nombreCarpeta}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        }
    });

    return multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // límite de 5MB por imagen
        // Segunda capa de defensa, además de allowed_formats de Cloudinary
        // (que filtra por extensión del nombre, no por contenido real del
        // archivo). Este fileFilter rechaza cualquier archivo cuyo
        // mimetype real no empiece con "image/", antes de que llegue a
        // Cloudinary — evita que alguien suba un binario disfrazado con
        // extensión .jpg falsa.
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Solo se permiten archivos de imagen'), false);
            }
        }
    });
};

module.exports = crearUploadMiddleware;
// Controller genérico para manejar la subida de imágenes a Cloudinary
// Reutilizable — la misma función sirve para obras, productos y cursos
// porque Multer + CloudinaryStorage ya dejan el archivo subido en req.file

const subirImagen = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                mensaje: 'No se recibió ninguna imagen'
            });
        }

        res.status(201).json({
            mensaje: 'Imagen subida correctamente',
            url: req.file.path,
            publicId: req.file.filename
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al subir la imagen',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Para subir múltiples imágenes a la vez (ej. las 17 obras del showroom, o varias fotos de un producto)
const subirMultiplesImagenes = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron imágenes'
            });
        }

        const imagenes = req.files.map((archivo) => ({
            url: archivo.path,
            publicId: archivo.filename
        }));

        res.status(201).json({
            mensaje: `${imagenes.length} imágenes subidas correctamente`,
            imagenes
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al subir las imágenes',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { subirImagen, subirMultiplesImagenes };
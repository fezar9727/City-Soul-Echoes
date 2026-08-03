const Obra = require('../models/Obra');
const cloudinary = require('../config/cloudinary');

const DIAS_RETENCION_PAPELERA = 30;

const crearObra = async (req, res) => {
    try {
        const { titulo, tituloEn, descripcion, serie, precio, categoria, imagenes, enVenta } = req.body;

        const existe = await Obra.findOne({ titulo, autor: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes una obra con ese título' });
        }

        if (!req.file) {
            return res.status(400).json({ ok: false, mensaje: 'La imagen de portada es obligatoria' });
        }

        const obra = await Obra.create({
            titulo, tituloEn, descripcion, serie, precio, categoria,
            imagenPortada: req.file.path,
            imagenPortadaPublicId: req.file.filename,
            imagenes,
            enVenta,
            autor: req.usuario._id
        });

        res.status(201).json({ ok: true, obra });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObras = async (req, res) => {
    try {
        const { autor } = req.query;
        const filtro = { disponible: true, eliminada: false };
        if (autor) filtro.autor = autor;
        const obras = await Obra.find(filtro)
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico')
            .sort({ createdAt: 1 });
        res.status(200).json({ ok: true, total: obras.length, obras });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener las obras', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id)
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico');

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        res.status(200).json({ ok: true, obra });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id);

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        if (obra.autor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar esta obra' });
        }

        const datosActualizados = { ...req.body };

        if (req.file) {
            datosActualizados.imagenPortada = req.file.path;
            datosActualizados.imagenPortadaPublicId = req.file.filename;
        }

        const obraActualizada = await Obra.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ ok: true, obra: obraActualizada });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Borrado suave: la obra no se elimina de verdad, se marca y se oculta.
// Queda recuperable desde la papelera durante DIAS_RETENCION_PAPELERA días.
const eliminarObra = async (req, res) => {
    try {
        const obra = await Obra.findById(req.params.id);

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada' });
        }

        if (obra.autor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar esta obra' });
        }

        obra.eliminada = true;
        obra.fechaEliminacion = new Date();
        await obra.save();

        res.status(200).json({ ok: true, mensaje: 'Obra movida a la papelera' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Lista las obras en papelera. Antes de responder, purga en forma permanente
// (Mongo + Cloudinary) cualquier obra que ya superó los DIAS_RETENCION_PAPELERA.
const obtenerPapelera = async (req, res) => {
    try {
        const limiteRetencion = new Date();
        limiteRetencion.setDate(limiteRetencion.getDate() - DIAS_RETENCION_PAPELERA);

        const obrasAPurgar = await Obra.find({
            eliminada: true,
            fechaEliminacion: { $lte: limiteRetencion }
        });

        for (const obra of obrasAPurgar) {
            if (obra.imagenPortadaPublicId) {
                await cloudinary.uploader.destroy(obra.imagenPortadaPublicId).catch(() => {});
            }
            await obra.deleteOne();
        }

        const obrasEnPapelera = await Obra.find({ eliminada: true }).sort({ fechaEliminacion: -1 });

        const obrasConDiasRestantes = obrasEnPapelera.map((obra) => {
            const diasTranscurridos = Math.floor((Date.now() - obra.fechaEliminacion) / (1000 * 60 * 60 * 24));
            const diasRestantes = DIAS_RETENCION_PAPELERA - diasTranscurridos;
            return { ...obra.toObject(), diasRestantes };
        });

        res.status(200).json({ ok: true, total: obrasConDiasRestantes.length, obras: obrasConDiasRestantes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la papelera', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const restaurarObra = async (req, res) => {
    try {
        const obra = await Obra.findOne({ _id: req.params.id, eliminada: true });

        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada en la papelera' });
        }

        obra.eliminada = false;
        obra.fechaEliminacion = null;
        await obra.save();

        res.status(200).json({ ok: true, mensaje: 'Obra restaurada correctamente', obra });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al restaurar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarDefinitivo = async (req, res) => {
    try {
        const obra = await Obra.findOne({ _id: req.params.id, eliminada: true });
        if (!obra) {
            return res.status(404).json({ ok: false, mensaje: 'Obra no encontrada en la papelera' });
        }
        if (obra.imagenPortadaPublicId) {
            await cloudinary.uploader.destroy(obra.imagenPortadaPublicId).catch(() => {});
        }
        await obra.deleteOne();
        res.status(200).json({ ok: true, mensaje: 'Obra eliminada definitivamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar la obra', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerObrasPropiasAdmin = async (req, res) => {
    try {
        const obras = await Obra.find({ autor: req.usuario._id, eliminada: false }).sort({ createdAt: -1 });
        res.status(200).json({ ok: true, total: obras.length, obras });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener tus obras', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = {
    crearObra, obtenerObras, obtenerObra, actualizarObra, eliminarObra,
    obtenerObrasPropiasAdmin, obtenerPapelera, restaurarObra, eliminarDefinitivo
};
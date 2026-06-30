const Publicacion = require('../models/Publicacion');

const crearPublicacion = async (req, res) => {
    try {
        const { contenido, imagenes, tipo } = req.body;

        const publicacion = await Publicacion.create({
            contenido, imagenes, tipo,
            autor: req.usuario._id
        });

        res.status(201).json({ ok: true, publicacion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear la publicación', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerPublicaciones = async (req, res) => {
    try {
        const { tipo } = req.query;
        const filtro = {};
        if (tipo) filtro.tipo = tipo;

        const publicaciones = await Publicacion.find(filtro)
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico perfilArtista.bio')
            .populate('comentarios.autor', 'nombreCompleto')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: publicaciones.length, publicaciones });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener las publicaciones', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerPublicacion = async (req, res) => {
    try {
        const publicacion = await Publicacion.findById(req.params.id)
            .populate('autor', 'nombreCompleto perfilArtista.nombreArtistico')
            .populate('comentarios.autor', 'nombreCompleto');

        if (!publicacion) {
            return res.status(404).json({ ok: false, mensaje: 'Publicación no encontrada' });
        }

        res.status(200).json({ ok: true, publicacion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la publicación', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarPublicacion = async (req, res) => {
    try {
        const publicacion = await Publicacion.findById(req.params.id);

        if (!publicacion) {
            return res.status(404).json({ ok: false, mensaje: 'Publicación no encontrada' });
        }

        if (publicacion.autor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar esta publicación' });
        }

        await publicacion.deleteOne();

        res.status(200).json({ ok: true, mensaje: 'Publicación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar la publicación', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const darLike = async (req, res) => {
    try {
        const publicacion = await Publicacion.findById(req.params.id);

        if (!publicacion) {
            return res.status(404).json({ ok: false, mensaje: 'Publicación no encontrada' });
        }

        const yaLeDioLike = publicacion.likes.includes(req.usuario._id);

        if (yaLeDioLike) {
            publicacion.likes = publicacion.likes.filter(
                id => id.toString() !== req.usuario._id.toString()
            );
        } else {
            publicacion.likes.push(req.usuario._id);
        }

        await publicacion.save();

        res.status(200).json({ ok: true, likes: publicacion.likes.length, leGustó: !yaLeDioLike });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al procesar el like', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const agregarComentario = async (req, res) => {
    try {
        const { contenido } = req.body;
        const publicacion = await Publicacion.findById(req.params.id);

        if (!publicacion) {
            return res.status(404).json({ ok: false, mensaje: 'Publicación no encontrada' });
        }

        publicacion.comentarios.push({
            contenido,
            autor: req.usuario._id
        });

        await publicacion.save();

        res.status(201).json({ ok: true, comentarios: publicacion.comentarios });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al agregar el comentario', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { crearPublicacion, obtenerPublicaciones, obtenerPublicacion, eliminarPublicacion, darLike, agregarComentario };
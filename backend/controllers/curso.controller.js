const Curso = require('../models/Curso');
const cloudinary = require('../config/cloudinary');

const DIAS_EN_PAPELERA = 30;
const MS_EN_PAPELERA = DIAS_EN_PAPELERA * 24 * 60 * 60 * 1000;

const crearCurso = async (req, res) => {
    try {
        const { titulo, descripcion, categoria, modalidad, precio, duracionHoras } = req.body;
        const lecciones = req.body.lecciones ? JSON.parse(req.body.lecciones) : [];
        const existe = await Curso.findOne({ titulo, docente: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes un curso con ese título' });
        }
        const datosCurso = {
            titulo, descripcion, categoria, modalidad,
            precio, duracionHoras, lecciones,
            docente: req.usuario._id
        };
        if (req.file) {
            datosCurso.imagenPortada = req.file.path;
            datosCurso.imagenPortadaPublicId = req.file.filename;
        }
        const curso = await Curso.create(datosCurso);
        res.status(201).json({ ok: true, curso });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerCursos = async (req, res) => {
    try {
        const { categoria, modalidad, docente } = req.query;
        const filtro = { publicado: true, eliminada: false };
        if (categoria) filtro.categoria = categoria;
        if (modalidad) filtro.modalidad = modalidad;
        if (docente) filtro.docente = docente;
        const cursos = await Curso.find(filtro)
            .populate('docente', 'nombreCompleto correo perfilDocente.nombrePublico perfilDocente.especialidad perfilDocente.metodoContacto perfilDocente.redes')
            .sort({ createdAt: -1 });
        res.status(200).json({ ok: true, total: cursos.length, cursos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los cursos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id)
            .populate('docente', 'nombreCompleto correo perfilDocente.nombrePublico perfilDocente.especialidad perfilDocente.bio perfilDocente.metodoContacto perfilDocente.redes');
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        res.status(200).json({ ok: true, curso });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        if (curso.docente.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar este curso' });
        }
        const datosActualizados = { ...req.body };
        if (datosActualizados.lecciones) {
            datosActualizados.lecciones = JSON.parse(datosActualizados.lecciones);
        }
        if (req.file) {
            datosActualizados.imagenPortada = req.file.path;
            datosActualizados.imagenPortadaPublicId = req.file.filename;
        }
        const cursoActualizado = await Curso.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { returnDocument: 'after', runValidators: true }
        );
        res.status(200).json({ ok: true, curso: cursoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Soft-delete: el curso se marca como eliminado y se mueve a la papelera,
// no se borra de la base de datos todavía — mismo patrón que Obras y Eventos.
const eliminarCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        if (curso.docente.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar este curso' });
        }
        curso.eliminada = true;
        curso.fechaEliminacion = new Date();
        await curso.save();
        res.status(200).json({ ok: true, mensaje: 'Curso movido a la papelera' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const publicarCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        if (curso.docente.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para publicar este curso' });
        }
        curso.publicado = !curso.publicado;
        await curso.save();
        res.status(200).json({ ok: true, mensaje: `Curso ${curso.publicado ? 'publicado' : 'despublicado'} correctamente`, curso });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al publicar el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// Devuelve los cursos en papelera, con purga automática de los que ya
// superaron los 30 días (lazy purge, mismo patrón que Obras y Eventos).
const obtenerPapelera = async (req, res) => {
    try {
        const ahora = Date.now();
        const cursosEnPapelera = await Curso.find({ eliminada: true });
        const paraPurgar = cursosEnPapelera.filter((curso) => {
            const tiempoEnPapelera = ahora - new Date(curso.fechaEliminacion).getTime();
            return tiempoEnPapelera >= MS_EN_PAPELERA;
        });
        for (const curso of paraPurgar) {
            if (curso.imagenPortadaPublicId) {
                await cloudinary.uploader.destroy(curso.imagenPortadaPublicId);
            }
            await curso.deleteOne();
        }
        const cursosVigentes = cursosEnPapelera.filter((curso) => !paraPurgar.includes(curso));
        const cursosConDiasRestantes = cursosVigentes.map((curso) => {
            const tiempoEnPapelera = ahora - new Date(curso.fechaEliminacion).getTime();
            const diasRestantes = Math.max(0, Math.ceil((MS_EN_PAPELERA - tiempoEnPapelera) / (24 * 60 * 60 * 1000)));
            return { ...curso.toObject(), diasRestantes };
        });
        res.status(200).json({ ok: true, total: cursosConDiasRestantes.length, cursos: cursosConDiasRestantes });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la papelera', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const restaurarCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        curso.eliminada = false;
        curso.fechaEliminacion = null;
        await curso.save();
        res.status(200).json({ ok: true, mensaje: 'Curso restaurado correctamente', curso });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al restaurar el curso', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarDefinitivo = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        if (curso.imagenPortadaPublicId) {
            await cloudinary.uploader.destroy(curso.imagenPortadaPublicId);
        }
        await curso.deleteOne();
        res.status(200).json({ ok: true, mensaje: 'Curso eliminado definitivamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar definitivamente', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = {
    crearCurso,
    obtenerCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
    publicarCurso,
    obtenerPapelera,
    restaurarCurso,
    eliminarDefinitivo
};
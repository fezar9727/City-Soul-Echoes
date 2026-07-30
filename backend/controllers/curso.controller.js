const Curso = require('../models/Curso');

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
        const { categoria, modalidad } = req.query;
        const filtro = { publicado: true };
        if (categoria) filtro.categoria = categoria;
        if (modalidad) filtro.modalidad = modalidad;
        const cursos = await Curso.find(filtro)
            .populate('docente', 'nombreCompleto perfilDocente.nombrePublico perfilDocente.especialidad')
            .sort({ createdAt: -1 });
        res.status(200).json({ ok: true, total: cursos.length, cursos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los cursos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id)
            .populate('docente', 'nombreCompleto perfilDocente.nombrePublico perfilDocente.especialidad perfilDocente.bio');
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

const eliminarCurso = async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) {
            return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
        }
        if (curso.docente.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar este curso' });
        }
        await curso.deleteOne();
        res.status(200).json({ ok: true, mensaje: 'Curso eliminado correctamente' });
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

module.exports = { crearCurso, obtenerCursos, obtenerCurso, actualizarCurso, eliminarCurso, publicarCurso };
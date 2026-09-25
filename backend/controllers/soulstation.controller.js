const SoulStation = require('../models/SoulStation');

const obtenerEstacion = async (req, res) => {
    try {
        const estacion = await SoulStation.findOne({ activo: true })
            .populate('admin', 'nombreCompleto');

        if (!estacion) {
            return res.status(404).json({ ok: false, mensaje: 'Soul Station no encontrada' });
        }

        res.status(200).json({ ok: true, estacion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la Soul Station', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const crearEstacion = async (req, res) => {
    try {
        const { nombre, descripcion, playlist } = req.body;

        const existe = await SoulStation.findOne({ activo: true });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya existe una Soul Station activa' });
        }

        const estacion = await SoulStation.create({
            nombre, descripcion, playlist,
            admin: req.usuario._id
        });

        res.status(201).json({ ok: true, estacion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear la Soul Station', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarEstacion = async (req, res) => {
    try {
        const estacion = await SoulStation.findOne({ activo: true });

        if (!estacion) {
            return res.status(404).json({ ok: false, mensaje: 'Soul Station no encontrada' });
        }

        // Bug real corregido: mismo patrón ya encontrado en obra, evento,
        // curso y producto — pasar req.body completo permitía mandar
        // { admin: "otroId" } para transferir la estación a otra cuenta,
        // o { activo: false } rompiendo la regla de "solo una estación
        // activa" sin pasar por ningún control. Solo se aceptan los
        // campos realmente editables por este endpoint.
        const { nombre, descripcion, playlist } = req.body;
        const datosActualizados = {};
        if (nombre !== undefined) datosActualizados.nombre = nombre;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
        if (playlist !== undefined) datosActualizados.playlist = playlist;

        const estacionActualizada = await SoulStation.findByIdAndUpdate(
            estacion._id,
            datosActualizados,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ ok: true, estacion: estacionActualizada });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar la Soul Station', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const toggleEnVivo = async (req, res) => {
    try {
        const estacion = await SoulStation.findOne({ activo: true });

        if (!estacion) {
            return res.status(404).json({ ok: false, mensaje: 'Soul Station no encontrada' });
        }

        estacion.enVivo = !estacion.enVivo;
        if (req.body.linkTransmision) estacion.linkTransmision = req.body.linkTransmision;
        await estacion.save();

        res.status(200).json({ ok: true, mensaje: `Transmisión ${estacion.enVivo ? 'iniciada' : 'finalizada'}`, estacion });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al cambiar estado de transmisión', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarPistaActual = async (req, res) => {
    try {
        const { pistaActual } = req.body;
        const estacion = await SoulStation.findOne({ activo: true });

        if (!estacion) {
            return res.status(404).json({ ok: false, mensaje: 'Soul Station no encontrada' });
        }

        if (pistaActual < 0 || pistaActual >= estacion.playlist.length) {
            return res.status(400).json({ ok: false, mensaje: 'Índice de pista inválido' });
        }

        estacion.pistaActual = pistaActual;
        await estacion.save();

        res.status(200).json({ ok: true, pistaActual: estacion.pistaActual, pista: estacion.playlist[pistaActual] });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar la pista', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { obtenerEstacion, crearEstacion, actualizarEstacion, toggleEnVivo, actualizarPistaActual };
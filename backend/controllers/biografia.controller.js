const Biografia = require('../models/Biografia');

const obtenerBiografia = async (req, res) => {
    try {
        const biografia = await Biografia.findOne();
        if (!biografia) {
            return res.status(404).json({ ok: false, mensaje: 'Biografía no configurada aún' });
        }
        res.status(200).json({ ok: true, biografia });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener la biografía', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { obtenerBiografia };
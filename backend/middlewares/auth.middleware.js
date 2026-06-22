const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const protegerRuta = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'No autorizado — falta el token de acceso'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(payload.id);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Usuario no válido o cuenta desactivada'
            });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = protegerRuta;
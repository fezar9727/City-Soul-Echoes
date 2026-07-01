const verificarVendedor = (req, res, next) => {
    if (!req.usuario.puedeVender && req.usuario.rol !== 'admin') {
        return res.status(403).json({
            ok: false,
            mensaje: 'No tienes permiso para vender — solicita aprobación al administrador'
        });
    }
    next();
};

module.exports = verificarVendedor;
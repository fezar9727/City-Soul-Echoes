const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: `Acceso denegado — se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
            });
        }
        next();
    };
};

module.exports = verificarRol;
const { validationResult } = require('express-validator');

const manejarErroresValidacion = (req, res, next) => {
    const errores = validationResult(req);

    if (errores.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        ok: false,
        errores: errores.array().map(err => ({
            campo:   err.path,
            mensaje: err.msg
        }))
    });
};

module.exports = manejarErroresValidacion;
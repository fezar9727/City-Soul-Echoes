const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const { enviarCorreoVerificacion, enviarCorreoRecuperacion } = require('../services/email.service');

const actualizarPerfil = async (req, res) => {
    try {
        const { nombreCompleto, telefono, ciudad, perfilArtista, perfilDocente } = req.body;
        const usuario = await Usuario.findById(req.usuario._id);

        if (nombreCompleto) usuario.nombreCompleto = nombreCompleto;
        if (telefono) usuario.telefono = telefono;
        if (ciudad) usuario.ciudad = ciudad;
        if (perfilArtista && usuario.rol === 'artista') usuario.perfilArtista = { ...usuario.perfilArtista.toObject(), ...perfilArtista };
        if (perfilDocente && usuario.rol === 'docente') usuario.perfilDocente = { ...usuario.perfilDocente.toObject(), ...perfilDocente };

        await usuario.save();

        const obj = usuario.toObject();
        delete obj.password;

        res.status(200).json({ ok: true, usuario: obj });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el perfil', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const cambiarRol = async (req, res) => {
    try {
        const { nuevoRol, perfilArtista, perfilDocente } = req.body;
        const rolesValidos = ['usuario', 'artista', 'docente'];

        if (!rolesValidos.includes(nuevoRol)) {
            return res.status(400).json({ ok: false, mensaje: 'Rol no válido. Debe ser: usuario, artista o docente' });
        }

        const usuario = await Usuario.findById(req.usuario._id);
        usuario.rol = nuevoRol;

        if (nuevoRol === 'artista' && perfilArtista) usuario.perfilArtista = perfilArtista;
        if (nuevoRol === 'docente' && perfilDocente) usuario.perfilDocente = perfilDocente;

        await usuario.save();

        const obj = usuario.toObject();
        delete obj.password;

        res.status(200).json({ ok: true, mensaje: `Rol cambiado a ${nuevoRol} correctamente`, usuario: obj });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al cambiar el rol', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(200).json({ ok: true, mensaje: 'Si el correo existe, recibirás un enlace de recuperación' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        usuario.resetPasswordToken = token;
        usuario.resetPasswordExpira = Date.now() + 60 * 60 * 1000;
        await usuario.save();

        await enviarCorreoRecuperacion(usuario.correo, usuario.nombreCompleto, token);

        res.status(200).json({ ok: true, mensaje: 'Si el correo existe, recibirás un enlace de recuperación' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al procesar la solicitud', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;

        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpira: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
        }

        usuario.password = nuevaPassword;
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpira = undefined;
        await usuario.save();

        res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al resetear la contraseña', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const verificarCorreo = async (req, res) => {
    try {
        const { token } = req.body;

        const usuario = await Usuario.findOne({
            verificacionToken: token,
            verificacionExpira: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
        }

        usuario.correoVerificado = true;
        usuario.verificacionToken = undefined;
        usuario.verificacionExpira = undefined;
        await usuario.save();

        res.status(200).json({ ok: true, mensaje: 'Correo verificado correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al verificar el correo', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = {
    actualizarPerfil,
    cambiarRol,
    forgotPassword,
    resetPassword,
    verificarCorreo
};
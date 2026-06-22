const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const limpiarUsuario = (usuario) => {
    const obj = usuario.toObject();
    delete obj.password;
    return obj;
};

const registrarUsuario = async (req, res) => {
    try {
        const { nombreCompleto, correo, password, telefono, ciudad } = req.body;

        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya existe una cuenta con este correo electrónico' });
        }

        const usuario = await Usuario.create({ nombreCompleto, correo, password, telefono, ciudad, rol: 'usuario' });
        const token = generarToken(usuario);

        res.status(201).json({ ok: true, token, usuario: limpiarUsuario(usuario) });
    } catch (error) {
        console.error('Error en registrarUsuario:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el usuario', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const registrarArtista = async (req, res) => {
    try {
        const { nombreCompleto, correo, password, telefono, ciudad, perfilArtista } = req.body;

        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya existe una cuenta con este correo electrónico' });
        }

        const usuario = await Usuario.create({ nombreCompleto, correo, password, telefono, ciudad, rol: 'artista', perfilArtista });
        const token = generarToken(usuario);

        res.status(201).json({ ok: true, token, usuario: limpiarUsuario(usuario) });
    } catch (error) {
        console.error('Error en registrarArtista:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el artista', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const registrarDocente = async (req, res) => {
    try {
        const { nombreCompleto, correo, password, telefono, ciudad, perfilDocente } = req.body;

        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya existe una cuenta con este correo electrónico' });
        }

        const usuario = await Usuario.create({ nombreCompleto, correo, password, telefono, ciudad, rol: 'docente', perfilDocente });
        const token = generarToken(usuario);

        res.status(201).json({ ok: true, token, usuario: limpiarUsuario(usuario) });
    } catch (error) {
        console.error('Error en registrarDocente:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error interno al registrar el docente', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const usuario = await Usuario.findOne({ correo }).select('+password');
        if (!usuario) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
        }

        const passwordCorrecta = await usuario.compararPassword(password);
        if (!passwordCorrecta) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
        }

        if (!usuario.activo) {
            return res.status(403).json({ ok: false, mensaje: 'Esta cuenta está desactivada — contacta al administrador' });
        }

        const token = generarToken(usuario);
        res.status(200).json({ ok: true, token, usuario: limpiarUsuario(usuario) });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error interno al iniciar sesión', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerPerfil = async (req, res) => {
    res.status(200).json({ ok: true, usuario: limpiarUsuario(req.usuario) });
};

module.exports = { registrarUsuario, registrarArtista, registrarDocente, login, obtenerPerfil };
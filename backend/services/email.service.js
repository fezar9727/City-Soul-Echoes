const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreoVerificacion = async (correo, nombre, token) => {
    const url = `${process.env.CLIENT_URL}/verificar-correo?token=${token}`;
    await transporter.sendMail({
        from: `"City Soul Echoes" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Verifica tu correo — City Soul Echoes',
        html: `
            <h2>Hola ${nombre}</h2>
            <p>Gracias por registrarte en City Soul Echoes.</p>
            <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
            <a href="${url}">${url}</a>
            <p>Este enlace expira en 24 horas.</p>
        `
    });
};

const enviarCorreoRecuperacion = async (correo, nombre, token) => {
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: `"City Soul Echoes" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Recupera tu contraseña — City Soul Echoes',
        html: `
            <h2>Hola ${nombre}</h2>
            <p>Recibimos una solicitud para recuperar tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva:</p>
            <a href="${url}">${url}</a>
            <p>Este enlace expira en 1 hora.</p>
            <p>Si no solicitaste esto, ignora este correo.</p>
        `
    });
};

module.exports = {
    enviarCorreoVerificacion,
    enviarCorreoRecuperacion
};
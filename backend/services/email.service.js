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



const enviarCorreoActualizacionPlan = async (correo, nombre, planAnterior, planNuevo, precioNuevo, montoExcedente) => {
    await transporter.sendMail({
        from: `"City Soul Echoes" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Tu plan de suscripción fue actualizado — City Soul Echoes',
        html: `
            <h2>Hola ${nombre}</h2>
            <p>Tu solicitud para convertirte en vendedor fue aprobada.</p>
            <p>Tu plan de suscripción cambió de <strong>${planAnterior}</strong> a <strong>${planNuevo}</strong>.</p>
            <p>Para activar tu nuevo plan, debes pagar el excedente correspondiente al tiempo restante de tu ciclo actual: <strong>$${montoExcedente} COP</strong>.</p>
            <p>Desde tu próximo ciclo de facturación, el valor mensual de tu plan será de <strong>$${precioNuevo} COP</strong>.</p>
            <p>Podrás publicar y vender productos apenas se confirme el pago del excedente.</p>
        `
    });
};

module.exports = {
    enviarCorreoVerificacion,
    enviarCorreoRecuperacion,
    enviarCorreoActualizacionPlan
};
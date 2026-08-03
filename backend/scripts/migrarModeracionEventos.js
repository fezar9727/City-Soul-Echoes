require('dotenv').config();
const mongoose = require('mongoose');
const Evento = require('../models/Evento');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    // Todos los eventos que ya existen se consideran aprobados y oficiales
    // (fueron creados vía admin antes de que existiera este sistema)
    const resultado = await Evento.updateMany(
        { estadoModeracion: { $exists: false } },
        { $set: { estadoModeracion: 'aprobado', esOficial: true, motivoRechazo: '' } }
    );
    console.log(`Eventos actualizados: ${resultado.modifiedCount}`);
    await mongoose.disconnect();
}

main();
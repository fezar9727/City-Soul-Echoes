require('dotenv').config();
const mongoose = require('mongoose');
const Usuario  = require('../models/Usuario');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const correoAdmin   = process.env.ADMIN_EMAIL;
        const passwordAdmin = process.env.ADMIN_PASSWORD;

        if (!correoAdmin || !passwordAdmin || !process.env.ADMIN_NAME) {
            console.error('❌ Faltan ADMIN_EMAIL, ADMIN_PASSWORD o ADMIN_NAME en el .env');
            process.exit(1);
        }

        const existe = await Usuario.findOne({ correo: correoAdmin });
        if (existe) {
            console.log('⚠️  Ya existe un usuario con ese correo');
            process.exit(0);
        }

        await Usuario.create({
            nombreCompleto: process.env.ADMIN_NAME,
            correo:         correoAdmin,
            password:       passwordAdmin,
            rol:            'admin'
        });

        console.log('✅ Cuenta admin creada correctamente');
        console.log(`   Correo: ${correoAdmin}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
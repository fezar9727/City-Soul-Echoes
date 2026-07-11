require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const axios = require('axios');
const Pago = require('../models/Pago');
const Suscripcion = require('../models/Suscripcion');
const Usuario = require('../models/Usuario');
const generarReferenciaPago = require('../utils/generarReferenciaPago');

const MONGO_URI = process.env.MONGO_URI;
const SERVIDOR_URL = 'http://localhost:4000';

async function main() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Conectado.\n');

  try {
    const suscripcionExistente = await Suscripcion.findOne();

    if (!suscripcionExistente) {
      console.error('ERROR: no hay ninguna Suscripcion en la base de datos para probar. Cree una primero.');
      process.exit(1);
    }

    const referencia = generarReferenciaPago();
    const montoPrueba = 1200;

    const pagoPrueba = await Pago.create({
      referencia,
      usuario: suscripcionExistente.usuario,
      concepto: 'actualizacion_plan',
      conceptoId: suscripcionExistente._id,
      conceptoModel: 'Suscripcion',
      monto: montoPrueba,
      estado: 'pendiente',
      planDestino: 'vendedor',
      precioPlanDestino: 10000
    });

    console.log(`Pago de prueba creado: ${referencia}`);

    const transaccionSimulada = {
      id: 'TEST-TX-' + Date.now(),
      status: 'APPROVED',
      reference: referencia,
      amount_in_cents: montoPrueba * 100
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];

    const valoresConcatenados = properties
      .map((ruta) => {
        const clave = ruta.split('.')[1];
        return transaccionSimulada[clave];
      })
      .join('');

    const cadenaAFirmar = `${valoresConcatenados}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`;
    const checksum = crypto.createHash('sha256').update(cadenaAFirmar).digest('hex').toUpperCase();

    const bodyWebhook = {
      event: 'transaction.updated',
      data: { transaction: transaccionSimulada },
      timestamp,
      signature: { checksum, properties }
    };

    console.log('Enviando webhook simulado con firma valida...\n');

    const respuesta = await axios.post(`${SERVIDOR_URL}/api/pagos/webhook`, bodyWebhook);

    console.log(`Respuesta del servidor: ${respuesta.status} - ${JSON.stringify(respuesta.data)}\n`);

    const pagoActualizado = await Pago.findById(pagoPrueba._id);
    const suscripcionActualizada = await Suscripcion.findById(suscripcionExistente._id);
    const usuarioActualizado = await Usuario.findById(suscripcionExistente.usuario);

    console.log('--- Verificacion final ---');
    console.log(`Pago.estado: ${pagoActualizado.estado} (esperado: aprobado)`);
    console.log(`Suscripcion.plan: ${suscripcionActualizada.plan} (esperado: vendedor)`);
    console.log(`Suscripcion.precio: ${suscripcionActualizada.precio} (esperado: 10000)`);
    console.log(`Usuario.puedeVender: ${usuarioActualizado.puedeVender} (esperado: true)`);

    const todoCorrecto =
      pagoActualizado.estado === 'aprobado' &&
      suscripcionActualizada.plan === 'vendedor' &&
      suscripcionActualizada.precio === 10000 &&
      usuarioActualizado.puedeVender === true;

    console.log(todoCorrecto ? '\nPRUEBA EXITOSA: el webhook acepta y procesa firmas validas correctamente.' : '\nATENCION: algo no coincide, revisar la logica.');
  } catch (error) {
    if (error.response) {
      console.error(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada.');
  }
}

main();
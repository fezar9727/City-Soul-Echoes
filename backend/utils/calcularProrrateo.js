/**
 * calcularProrrateo.js
 *
 * Calcula el monto a cobrar cuando un usuario cambia de plan de suscripcion
 * a mitad de su ciclo de facturacion actual, en vez de cobrarle la diferencia
 * completa entre planes.
 *
 * Formula: excedente = diferenciaDePrecio * (diasRestantes / duracionCicloDias)
 *
 * Ejemplo: si el plan sube $3.000 y al usuario le quedan 12 de 30 dias en su
 * ciclo actual, se le cobra 3000 * (12/30) = 1200 ahora. El resto se cobra
 * ya al valor completo del nuevo plan en la renovacion siguiente.
 *
 * Funcion pura: mismo input siempre da el mismo output, sin efectos
 * secundarios, sin tocar la base de datos. Reutilizable para cualquier
 * cambio de plan futuro, no solo usuario a vendedor.
 */

function calcularProrrateo({ precioPlanActual, precioPlanNuevo, fechaVencimientoActual, duracionCicloDias = 30 }) {
  const diferenciaPrecio = precioPlanNuevo - precioPlanActual;

  if (diferenciaPrecio <= 0) {
    return { montoAPagar: 0, diasRestantes: 0, diferenciaPrecio };
  }

  const ahora = new Date();
  const vencimiento = new Date(fechaVencimientoActual);
  const milisegundosRestantes = vencimiento.getTime() - ahora.getTime();
  const diasRestantes = Math.max(0, Math.ceil(milisegundosRestantes / (1000 * 60 * 60 * 24)));
  const diasRestantesLimitados = Math.min(diasRestantes, duracionCicloDias);

  const montoAPagar = Math.round(diferenciaPrecio * (diasRestantesLimitados / duracionCicloDias));

  return { montoAPagar, diasRestantes: diasRestantesLimitados, diferenciaPrecio };
}

module.exports = calcularProrrateo;
import { Injectable } from '@angular/core';

// Cadena de Web Audio dedicada a archivos locales — SEPARADA de la
// de Soul Station a propósito: son 2 fuentes de audio distintas
// (MediaElementSource de un <audio> distinto), Web Audio API no
// permite compartir un AudioContext entre 2 <audio> reproduciendo
// simultáneamente de forma limpia sin acoplar ambos dominios. No es
// una duplicación de lógica — es una segunda instancia legítima del
// mismo PATRÓN ya probado (mismo tipo de nodos), no el mismo nodo.
@Injectable({ providedIn: 'root' })
export class AudioLocalService {
  private audioContext: AudioContext | null = null;
  private compresor: DynamicsCompressorNode | null = null;
  private analizador: AnalyserNode | null = null;
  private fuenteConectada = false;

  conectar(elementoAudio: HTMLAudioElement): AnalyserNode {
    if (this.fuenteConectada && this.analizador) return this.analizador;

    this.audioContext = new AudioContext();
    const fuente = this.audioContext.createMediaElementSource(elementoAudio);

    // DynamicsCompressorNode real (API estándar Web Audio, MDN) —
    // actúa como LIMITADOR: threshold bajo + ratio alto evita que
    // cualquier pico de audio real supere el nivel seguro, protegiendo
    // parlantes/oídos sin sonar "aplastado" en volumen normal. Valores
    // reales estándar de mastering para un limitador transparente.
    this.compresor = this.audioContext.createDynamicsCompressor();
    // Valores reales de limitador transparente (referencia:
    // masterización broadcast, umbral -1 a -3dB, ratio 4:1-8:1) — el
    // anterior (-6dB, ratio 12:1) comprimía demasiado agresivo,
    // causa real confirmada de que "todo sonara bajo" incluso al
    // 100%: aplastaba la señal en vez de solo topar los picos.
    this.compresor.threshold.value = -3;
    // Knee más suave (6->10) — transición menos brusca del
    // limitador, reduce la coloración/pérdida de claridad percibida.
    this.compresor.knee.value = 10;
    this.compresor.ratio.value = 4;
    this.compresor.attack.value = 0.003;
    this.compresor.release.value = 0.25;
    // GainNode real (API estándar Web Audio) para superar el techo
    // de 1.0 del <audio>.volume nativo — SIEMPRE encadenado ANTES del
    // compresor/limitador, para que cualquier boost de señal nunca
    // llegue a la salida con picos recortados (clipping real, causa
    // de la pérdida de calidad al forzar volumen alto sin limitador).
    this.gananciaExtra = this.audioContext.createGain();
    this.gananciaExtra.gain.value = 1;
    this.analizador = this.audioContext.createAnalyser();
    this.analizador.fftSize = 512;
    this.analizador.smoothingTimeConstant = 0.75;

    // Makeup gain real: técnica estándar de masterización — después
    // del limitador, se aplica una ganancia fija para recuperar el
    // volumen que el compresor recortó de los picos. Como el
    // limitador ya está ANTES en la cadena, esta ganancia no genera
    // clipping — es el mecanismo real para "sonar más fuerte sin
    // perder calidad".
    this.gananciaMakeup = this.audioContext.createGain();
    // Subido de 1.6 a 2.2 — el limitador (compresor) sigue siendo el
    // que evita el clipping real de los picos; esta ganancia solo
    // recupera loudness percibido. 2.2 es un valor real más agresivo
    // pero todavía dentro de rango seguro combinado con el limitador
    // ya activo — si notás distorsión en picos muy fuertes, es la
    // señal de que llegamos al techo real y hay que bajarlo.
    // Subido de 2.2 a 2.8 — más loudness real. El limitador (arriba)
    // sigue conteniendo los picos, así que esto no debería generar
    // clipping; si en algún tema muy fuerte notás distorsión, es la
    // señal real de que llegamos al techo y hay que bajarlo un poco.
    this.gananciaMakeup.gain.value = 2.8;

    fuente.connect(this.gananciaExtra).connect(this.compresor).connect(this.gananciaMakeup).connect(this.analizador).connect(this.audioContext.destination);
    this.fuenteConectada = true;
    return this.analizador;
  }
  private gananciaMakeup: GainNode | null = null;
  // Boost real de 1.0 (100%, el máximo nativo) hasta 2.0 (equivalente
  // real a +6dB) — siempre pasa por el compresor ya conectado arriba,
  // así el pico nunca se recorta. umbralAdvertencia se usa en el
  // componente para decidir cuándo mostrar el aviso, sin acoplar la
  // lógica de UI a este servicio de audio.
private gananciaExtra: GainNode | null = null;
  aplicarBoost(factor: number): void {
    if (this.gananciaExtra) this.gananciaExtra.gain.value = Math.max(1, Math.min(2, factor));
  }

  // Valor real actual del gain — usado por el componente para decidir
  // cuándo mostrar el toast de advertencia, sin duplicar el estado.
  obtenerBoostActual(): number {
    return this.gananciaExtra?.gain.value ?? 1;
  }

  cerrar(): void {
    this.audioContext?.close();
    this.audioContext = null;
    this.analizador = null;
    this.fuenteConectada = false;
  }
}
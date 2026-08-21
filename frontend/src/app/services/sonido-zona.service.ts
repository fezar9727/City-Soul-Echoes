import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigZonaSonido, IdZonaSonido } from '../models/sonido-zona.model';

const CLAVE_VOLUMEN = 'cse_volumen_ambiente';
const CLAVE_MUTE = 'cse_mute_ambiente';
const VOLUMEN_POR_DEFECTO = 0.22;
const NIVEL_RMS_OBJETIVO = 0.05;
const FADE_IN_SEG = 2.8;
const FADE_OUT_SEG = 2.4;
const VELOCIDAD_AMBIENTE = 0.82;

// Config del motor del cohete separada de CONFIG_ZONAS: vive en su
// propio canal de audio, independiente de las 11 zonas ambientales,
// para que ambos puedan sonar a la vez (scroll + card de zona abierta).
const CONFIG_MOTOR = { archivo: 'cohete-motor.mp3', gananciaCalibrada: 0.13, velocidad: 1 };

const CONFIG_ZONAS: Record<IdZonaSonido, ConfigZonaSonido> = {
  'vault': { archivo: 'vault-monasterio.mp3', gananciaCalibrada: 0.28, velocidad: VELOCIDAD_AMBIENTE },
  'vegana': { archivo: 'vegana-bosque.mp3', gananciaCalibrada: 0.35, velocidad: VELOCIDAD_AMBIENTE },
  'moda': { archivo: 'moda-lfo.mp3', gananciaCalibrada: 0.2, velocidad: VELOCIDAD_AMBIENTE },
  'salud-mental': { archivo: 'salud-mental-drone.mp3', gananciaCalibrada: 0.15, velocidad: VELOCIDAD_AMBIENTE },
  'noticias': { archivo: 'noticias-estatica.mp3', gananciaCalibrada: 0.25, velocidad: VELOCIDAD_AMBIENTE },
  'cultura': { archivo: 'cultura-campanas.mp3', gananciaCalibrada: 0.3, velocidad: VELOCIDAD_AMBIENTE },
  'videojuegos': { archivo: 'videojuegos-glitch.mp3', gananciaCalibrada: 0.22, velocidad: VELOCIDAD_AMBIENTE },
    'editar-perfil': { archivo: 'perfil-escritura.mp3', gananciaCalibrada: 0.32, velocidad: VELOCIDAD_AMBIENTE },
  'panel-obras': { archivo: 'panel-obras-taller.mp3', gananciaCalibrada: 0.3, velocidad: VELOCIDAD_AMBIENTE },
  'panel-eventos': { archivo: 'panel-eventos-reloj.mp3', gananciaCalibrada: 0.3, velocidad: VELOCIDAD_AMBIENTE },
  'panel-cursos': { archivo: 'panel-cursos-libro.mp3', gananciaCalibrada: 0.3, velocidad: VELOCIDAD_AMBIENTE }
};

@Injectable({ providedIn: 'root' })
export class SonidoZonaService {
  private audioContext: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private gananciasNormalizadas = new Map<string, number>();
  private gananciaMaestra: GainNode | null = null;
  private gestoDesbloqueado = false;

  // Canal 1: ambiente de zona (Vault, Bienestar, Artículos, etc.)
  private fuenteZona: AudioBufferSourceNode | null = null;
  private gananciaZona: GainNode | null = null;

  // Canal 2: motor del cohete — independiente, puede sonar a la vez
  // que el canal de zona.
  private fuenteMotor: AudioBufferSourceNode | null = null;
  private gananciaMotor: GainNode | null = null;
  private motorDebeSonar = false;
  // Bandera de bloqueo: evita que 2 llamadas a reproducirMotor() corran
  // en simultáneo. Sin esto, si el usuario soltaba y volvía a scrollear
  // ANTES de que la primera carga terminara (fetch+decode asíncrono),
  // ambas llamadas pasaban el chequeo "if (fuenteMotor) return" porque
  // ninguna había terminado todavía — la última en resolver pisaba la
  // referencia de this.fuenteMotor, dejando la primera fuente huérfana
  // sonando en loop para siempre, sin nada que pudiera detenerla.
  private motorIniciando = false;

  private volumenSubject = new BehaviorSubject<number>(this.leerVolumenGuardado());
  private muteSubject = new BehaviorSubject<boolean>(this.leerMuteGuardado());

  volumen$ = this.volumenSubject.asObservable();
  mute$ = this.muteSubject.asObservable();

  get volumenActual(): number {
    return this.volumenSubject.value;
  }

  get muteActual(): boolean {
    return this.muteSubject.value;
  }

  constructor() {
    // El scroll NO cuenta como "gesto de usuario" para las políticas de
    // autoplay de Chrome/Edge (solo click, touch o tecla) — documentado
    // en la especificación de User Activation del navegador. Si el
    // motor del cohete solo escuchara al evento scroll, el AudioContext
    // quedaría bloqueado sin sonar. Este listener, una sola vez, capta
    // el primer gesto real (sea cual sea) y desbloquea el contexto
    // antes de que el scroll lo necesite.
    const desbloquear = () => {
      if (this.gestoDesbloqueado) return;
      this.gestoDesbloqueado = true;
      const ctx = this.asegurarContexto();
      if (ctx.state === 'suspended') ctx.resume();
      document.removeEventListener('pointerdown', desbloquear);
      document.removeEventListener('keydown', desbloquear);
      document.removeEventListener('touchstart', desbloquear);
    };
        document.addEventListener('pointerdown', desbloquear, { once: true });
    document.addEventListener('keydown', desbloquear, { once: true });
    document.addEventListener('touchstart', desbloquear, { once: true });
    // 'wheel' no está formalmente en la lista de gestos garantizados
    // por la especificación de autoplay de Chrome (developer.chrome.com/
    // blog/autoplay) — solo click/tap/teclas específicas lo están. Se
    // agrega igual como intento adicional: en la práctica, algunos
    // navegadores sí lo aceptan como activación válida. No sustituye
    // un click real si el navegador lo rechaza.
    document.addEventListener('wheel', desbloquear, { once: true, passive: true });
  }

  private leerVolumenGuardado(): number {
    const guardado = localStorage.getItem(CLAVE_VOLUMEN);
    return guardado !== null ? Number(guardado) : VOLUMEN_POR_DEFECTO;
  }

  private leerMuteGuardado(): boolean {
    return localStorage.getItem(CLAVE_MUTE) === 'true';
  }

  private asegurarContexto(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gananciaMaestra = this.audioContext.createGain();
      this.gananciaMaestra.gain.value = this.muteActual ? 0 : this.volumenActual;
      this.gananciaMaestra.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  private async cargarArchivo(ctx: AudioContext, archivo: string): Promise<AudioBuffer> {
    const yaCargado = this.buffers.get(archivo);
    if (yaCargado) return yaCargado;
    const respuesta = await fetch(`/audio/sonidos/${archivo}`);
    const arrayBuffer = await respuesta.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.buffers.set(archivo, audioBuffer);
    this.gananciasNormalizadas.set(archivo, this.calcularGananciaNormalizada(audioBuffer));
    return audioBuffer;
  }

  private calcularGananciaNormalizada(buffer: AudioBuffer): number {
    let sumaCuadrados = 0;
    let totalMuestras = 0;
    for (let canal = 0; canal < buffer.numberOfChannels; canal++) {
      const datos = buffer.getChannelData(canal);
      for (let i = 0; i < datos.length; i += 64) {
        sumaCuadrados += datos[i] * datos[i];
        totalMuestras++;
      }
    }
    const rms = totalMuestras > 0 ? Math.sqrt(sumaCuadrados / totalMuestras) : 0;
    if (rms === 0) return 1;
    return Math.min(NIVEL_RMS_OBJETIVO / rms, 2);
  }

  // ===================== Canal de zona (ambiente por sección) =====================
  async reproducirZona(idZona: IdZonaSonido): Promise<void> {
    if (this.muteActual) return;
    try {
      const ctx = this.asegurarContexto();
      if (ctx.state === 'suspended') await ctx.resume();
      const config = CONFIG_ZONAS[idZona];
      const buffer = await this.cargarArchivo(ctx, config.archivo);
      this.detenerActual();

      const fuente = ctx.createBufferSource();
      fuente.buffer = buffer;
      fuente.loop = true;
      fuente.playbackRate.value = config.velocidad;

      const gananciaNormalizada = this.gananciasNormalizadas.get(config.archivo) ?? 1;
      const gananciaFinal = gananciaNormalizada * config.gananciaCalibrada;

      const nodoGanancia = ctx.createGain();
      nodoGanancia.gain.setValueAtTime(0, ctx.currentTime);
      nodoGanancia.gain.linearRampToValueAtTime(gananciaFinal, ctx.currentTime + FADE_IN_SEG);
      fuente.connect(nodoGanancia);
      nodoGanancia.connect(this.gananciaMaestra!);
      fuente.start(0);
      this.fuenteZona = fuente;
      this.gananciaZona = nodoGanancia;
    } catch {
      // El sonido es una mejora, nunca una dependencia funcional.
    }
  }

  detenerActual(): void {
    this.detenerFuente(this.fuenteZona, this.gananciaZona);
    this.fuenteZona = null;
    this.gananciaZona = null;
  }

  // ===================== Canal del motor del cohete =====================
  async reproducirMotor(): Promise<void> {
    if (this.muteActual || this.fuenteMotor || this.motorIniciando) return;
    this.motorIniciando = true;
    this.motorDebeSonar = true;
    try {
      const ctx = this.asegurarContexto();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await this.cargarArchivo(ctx, CONFIG_MOTOR.archivo);

      // Si en el tiempo que tardó cargar (primera vez, sin caché) el
      // usuario ya soltó y detenerMotor() ya se llamó, no arrancamos
      // el sonido — evita el bug de "queda sonando para siempre".
      if (!this.motorDebeSonar) return;

      const fuente = ctx.createBufferSource();
      fuente.buffer = buffer;
      fuente.loop = true;
      fuente.playbackRate.value = CONFIG_MOTOR.velocidad;

      const gananciaNormalizada = this.gananciasNormalizadas.get(CONFIG_MOTOR.archivo) ?? 1;
      const gananciaFinal = gananciaNormalizada * CONFIG_MOTOR.gananciaCalibrada;

            // Fade in casi instantáneo (0.05s) — solo lo justo para evitar un
      // "click" audible al arrancar de golpe en 0ms, sin el efecto de
      // aparición gradual que sí tienen las 11 zonas ambientales.
      const nodoGanancia = ctx.createGain();
      nodoGanancia.gain.setValueAtTime(0, ctx.currentTime);
      nodoGanancia.gain.linearRampToValueAtTime(gananciaFinal, ctx.currentTime + 0.05);
      fuente.connect(nodoGanancia);
      nodoGanancia.connect(this.gananciaMaestra!);
      fuente.start(0);
      this.fuenteMotor = fuente;
      this.gananciaMotor = nodoGanancia;
    } catch {
      // Igual que en zonas: si falla, el efecto visual sigue andando.
    } finally {
      // Se libera el bloqueo siempre, éxito o error, para que la
      // próxima vez que el usuario scrollee pueda arrancar de nuevo.
      this.motorIniciando = false;
    }
  }

    // El motor corta al instante (sin fade) — a diferencia del ambiente
  // de zona, reacciona al scroll en tiempo real, y un fade de 2.4s
  // hacía que el sonido siguiera unos milisegundos después de que el
  // usuario ya se había detenido, rompiendo la sensación de reacción
  // inmediata al movimiento.
  detenerMotor(): void {
    this.motorDebeSonar = false;
    if (this.fuenteMotor) {
      try {
        this.fuenteMotor.stop();
      } catch {
        // Ya se había detenido solo.
      }
      this.fuenteMotor = null;
    }
    this.gananciaMotor = null;
  }
  // Lógica de fade out — usada solo por el canal de zona (Vault,
  // Bienestar, Artículos, etc.), donde el fade sí tiene sentido porque
  // responde a una acción deliberada del usuario (abrir/cerrar una
  // card), no a un evento continuo como el scroll.
  private detenerFuente(fuente: AudioBufferSourceNode | null, ganancia: GainNode | null): void {
    if (!fuente || !ganancia || !this.audioContext) return;
    const ctx = this.audioContext;
    const nivelActual = ganancia.gain.value;
    ganancia.gain.cancelScheduledValues(ctx.currentTime);
    ganancia.gain.setValueAtTime(nivelActual, ctx.currentTime);
    ganancia.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_SEG);
    try {
      fuente.stop(ctx.currentTime + FADE_OUT_SEG);
    } catch {
      // Ya se había detenido solo.
    }
  }

  establecerVolumen(valor: number): void {
    const clamped = Math.min(Math.max(valor, 0), 1);
    this.volumenSubject.next(clamped);
    localStorage.setItem(CLAVE_VOLUMEN, String(clamped));
    if (this.gananciaMaestra && !this.muteActual) {
      this.gananciaMaestra.gain.value = clamped;
    }
  }

  alternarMute(): void {
    const nuevoEstado = !this.muteActual;
    this.muteSubject.next(nuevoEstado);
    localStorage.setItem(CLAVE_MUTE, String(nuevoEstado));
    // Mutear/desmutear solo mueve la ganancia maestra a 0 o de vuelta
    // al volumen real — NO destruye las fuentes de audio. Antes se
    // llamaba a detenerActual()/detenerMotor() al mutear, lo cual
    // detiene el AudioBufferSourceNode de forma irreversible (no existe
    // "pausa" real en la Web Audio API para ese nodo); al desmutear no
    // quedaba nada que reanudar. Ahora la pista sigue sonando "por
    // dentro" en silencio mientras está muteado, y vuelve a
    // escucharse de inmediato al desmutear, como esperaría cualquier
    // control de mute real (igual que el mute de un reproductor de
    // video, que no reinicia el contenido).
    if (this.gananciaMaestra) {
      this.gananciaMaestra.gain.value = nuevoEstado ? 0 : this.volumenActual;
    }
  }
}
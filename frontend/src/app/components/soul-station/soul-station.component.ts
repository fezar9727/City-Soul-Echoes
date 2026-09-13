import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoulStationService } from '../../services/soul-station.service';
import { Pista } from '../../models/soul-station.model';
import { RevealDirective } from '../../directives/reveal.directive';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

type ModoLoop = 'ninguno' | 'pista' | 'lista';

// Cada banda es un filtro peaking real en cadena — patrón estándar de
// ecualizador gráfico (BiquadFilterNode, spec W3C Web Audio API).
// Array en vez de propiedades sueltas: agregar/quitar una banda es
// 1 línea acá, no tocar 5 lugares distintos del componente.
interface BandaEcualizador {
  nombre: string;
  frecuenciaHz: number;
  tipo: BiquadFilterType;
  ganancia: number;
}

@Component({
  selector: 'app-soul-station',
  imports: [CommonModule, RevealDirective, RouterLink],
  templateUrl: './soul-station.component.html',
  styleUrl: './soul-station.component.css'
})
export class SoulStationComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  // Referencia al overlay ampliado — se mueve a document.body en
  // ngAfterViewInit (ver más abajo) para escapar de cualquier
  // ancestro con transform (la propia RevealDirective de la sección
  // aplica transform para su animación), que rompe position:fixed
  // según la spec de CSS Transforms (MDN). Sin este fix, el overlay
  // quedaba centrado respecto a la sección, no a la ventana completa.
  @ViewChild('overlayCaratulaRef') overlayCaratulaRef?: ElementRef<HTMLElement>;

  playlist: Pista[] = [];
  nombreEstacion = '';
  descripcionEstacion = '';
  cargando = true;
  error = false;
  indiceActual = 0;
  reproduciendo = false;
  volumen = 0.7;
  aleatorio = false;
  modoLoop: ModoLoop = 'ninguno';
  tiempoActualSegundos = 0;
  duracionTotalSegundos = 0;
  mostrandoTiempoExacto = false;
  mostrandoVolumenExacto = false;

  bandas: BandaEcualizador[] = [
    { nombre: 'Sub', frecuenciaHz: 60, tipo: 'lowshelf', ganancia: 0 },
    { nombre: 'Graves', frecuenciaHz: 150, tipo: 'peaking', ganancia: 0 },
    { nombre: 'Med-Bajo', frecuenciaHz: 400, tipo: 'peaking', ganancia: 0 },
    { nombre: 'Medios', frecuenciaHz: 1000, tipo: 'peaking', ganancia: 0 },
    { nombre: 'Med-Alto', frecuenciaHz: 2400, tipo: 'peaking', ganancia: 0 },
    { nombre: 'Presencia', frecuenciaHz: 6000, tipo: 'peaking', ganancia: 0 },
    { nombre: 'Brillo', frecuenciaHz: 12000, tipo: 'highshelf', ganancia: 0 }
  ];

  // Barras del visualizador — se llenan en cada frame con la
  // amplitud real de frecuencia leída del audio que suena.
  barrasVisualizador: number[] = new Array(28).fill(2);

  // Alterna entre el VU-meter de barras LED y el visualizador PS1
  // (geometría psicodélica) — comparten el mismo panel y el mismo
  // AnalyserNode ya conectado, evitando una segunda cadena de audio.
  modoVisualizador: 'barras' | 'ps1' = 'barras';
  @ViewChild('canvasPS1') canvasPS1Ref?: ElementRef<HTMLCanvasElement>;
  private mousePS1X = 0;
  private mousePS1Y = 0;
  private pulsoPS1 = 0; // 0-1, decae solo — dispara un "estallido" al hacer click
  private particulasPS1: { angulo: number; radio: number; velocidad: number; hueOffset: number }[] = [];

  toggleModoVisualizador(): void {
    this.modoVisualizador = this.modoVisualizador === 'barras' ? 'ps1' : 'barras';
  }

  // ===== MODO INMERSIVO — experiencia de pantalla completa estilo
  // SoundScope (visualizador real integrado del reproductor de CD de
  // PlayStation 1, confirmado por capturas documentadas del BIOS).
  // Reutiliza el mismo AnalyserNode y la misma matemática de
  // dibujarPS1, escalada a pantalla completa con mezcla de color real
  // vía globalCompositeOperation (API estándar de Canvas 2D, MDN).
  modoInmersivo = false;
  // Ciclo de efectos individuales — referencia real confirmada: el
  // botón SELECT del PS1 alternaba entre patrones DISTINTOS, no todos
  // mezclados a la vez. Cada modo activa una sola capa de dibujo.
  // Extendido con 2 modos nuevos, verificados contra fuentes reales
  // sobre el hardware original de PS1 (osciloscopio = line de amplitud
  // en el tiempo, vórtice = línea espiral con radio creciente según
  // amplitud) — ambos reutilizan this.analizador ya conectado, sin
  // crear ningún AudioContext ni nodo nuevo (punto 3 del Prompt
  // Maestro: nunca duplicar la cadena de audio ya existente).
  // 3 modos nuevos: mandala (pétalos simétricos multicapa), tunel
  // (anillos concéntricos hipnóticos), fractal (ráfaga recursiva de
  // triángulos) — cada uno reutiliza el mismo AnalyserNode/buffers ya
  // conectados, sin crear nada nuevo (punto 3 del Prompt Maestro).
  readonly modosEfectoFondo = ['cuñas', 'rayos', 'organico', 'osciloscopio', 'vortice', 'mandala', 'tunel', 'fractal', 'completo'] as const;
  modoEfectoFondoActual: typeof this.modosEfectoFondo[number] = 'completo';
  ciclarEfectoFondo(): void {
    const i = this.modosEfectoFondo.indexOf(this.modoEfectoFondoActual);
    this.modoEfectoFondoActual = this.modosEfectoFondo[(i + 1) % this.modosEfectoFondo.length];
  }
  @ViewChild('canvasInmersivoRef') canvasInmersivoRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayInmersivoRef') overlayInmersivoRef?: ElementRef<HTMLElement>;
  private mouseInmersivoX = 0;
  private mouseInmersivoY = 0;

  cdInmersivoAmpliado = false;

  // Fullscreen API real (W3C) — a diferencia del overlay fijo
  // anterior, esto toma control real de la pantalla (oculta barra de
  // navegador en la mayoría de casos), igual que el botón de
  // pantalla completa de YouTube. Esc siempre lo cierra — restricción
  // de seguridad del navegador que ningún sitio puede desactivar.
  async toggleModoInmersivo(): Promise<void> {
    const el = this.overlayInmersivoRef?.nativeElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
      this.reiniciarTimeoutUI();
    } else {
      await document.exitFullscreen().catch(() => {});
      if (this.timeoutOcultarUI) clearTimeout(this.timeoutOcultarUI);
    }
  }

  // Sincroniza el estado real: si el usuario sale con Esc (no con
  // nuestro botón), este evento es la única forma confiable de
  // enterarnos y actualizar modoInmersivo — sin esto, la UI quedaría
  // creyendo que seguimos en pantalla completa cuando ya no es así.
  private alCambiarFullscreen = () => {
    this.modoInmersivo = !!document.fullscreenElement;
    document.body.classList.toggle('soul-scroll-bloqueado', this.modoInmersivo);
  };

  // Auto-oculta la UI tras 30s sin interacción (mousemove/click) —
  // comportamiento real del SoundScope del PS1: tras inactividad,
  // desaparece todo el panel y solo queda el efecto de fondo.
  uiInmersivaVisible = true;
  private timeoutOcultarUI: ReturnType<typeof setTimeout> | null = null;
  private reiniciarTimeoutUI(): void {
    this.uiInmersivaVisible = true;
    if (this.timeoutOcultarUI) clearTimeout(this.timeoutOcultarUI);
    this.timeoutOcultarUI = setTimeout(() => {
      this.uiInmersivaVisible = false;
    }, 30000);
  }

  toggleAmpliarCD(evento: Event): void {
    evento.preventDefault();
    this.cdInmersivoAmpliado = !this.cdInmersivoAmpliado;
  }

  // Ocultamiento MANUAL (distinto del automático por inactividad):
  // una vez activado, mover el mouse NO lo revierte — solo otro click
  // en el mismo botón lo reactiva. Se combina con uiInmersivaVisible
  // (el automático) en el HTML vía OR: cualquiera de los dos oculta.
  uiInmersivaOcultaManual = false;
  toggleOcultarManualUI(evento: Event): void {
    evento.stopPropagation();
    this.uiInmersivaOcultaManual = !this.uiInmersivaOcultaManual;
  }

  private ultimoReinicioUI = 0;
  onMouseMoveInmersivo(evento: MouseEvent): void {
    this.mouseInmersivoX = evento.clientX;
    this.mouseInmersivoY = evento.clientY;
    // Throttle real: reiniciarTimeoutUI() dispara detección de
    // cambios de Angular (uiInmersivaVisible = true recalcula todo
    // el template) — sin limitarlo, se ejecutaba en cada pixel de
    // movimiento del mouse (decenas de veces/segundo), compitiendo
    // por el mismo hilo que requestAnimationFrame del canvas. Causa
    // raíz real de la traba reportada, distinta del bug de memoria
    // ya corregido antes.
    const ahora = performance.now();
    if (ahora - this.ultimoReinicioUI > 500) {
      this.ultimoReinicioUI = ahora;
      this.reiniciarTimeoutUI();
    }
  }

  onClickInmersivo(): void {
    this.pulsoPS1 = 1;
  }

  onMouseMovePS1(evento: MouseEvent): void {
    const rect = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    this.mousePS1X = evento.clientX - rect.left;
    this.mousePS1Y = evento.clientY - rect.top;
  }

  onClickPS1(): void {
    this.pulsoPS1 = 1;
  }
  // Cantidad de segmentos LED por columna — usado para calcular
  // cuántos "cuadritos" de cada barra están encendidos según su altura.
  readonly segmentosPorColumna = 12;

  private historialAleatorio: number[] = [];
  private audioContext: AudioContext | null = null;
  private filtrosEq: BiquadFilterNode[] = [];
  private analizador: AnalyserNode | null = null;
  // Buffers reutilizables — se crean UNA vez cuando se conecta el
  // analizador, no en cada frame. Crear un Uint8Array nuevo 60 veces
  // por segundo genera basura de memoria constante (garbage
  // collection), causa real confirmada de las trabas reportadas.
  // Tipado explícito <ArrayBuffer> (no el genérico ArrayBufferLike)
  // — getByteTimeDomainData/getByteFrequencyData (AnalyserNode, MDN)
  // exigen ese tipo exacto en TypeScript estricto; sin esto, el
  // compilador rechaza la asignación (TS2345), error real que
  // aparecía en el panel de Problemas, no cosmético.
  private bufferTiempo: Uint8Array<ArrayBuffer> | null = null;
  private bufferFrecuenciaExtra: Uint8Array<ArrayBuffer> | null = null;
  private fuenteConectada = false;
  private frameVisualizadorId: number | null = null;
  reproduciendoReversa = false;
  reversaPausada = false;
  cargandoReversa = false;
  volumenReversa = 0.7;
  private fuenteReversa: AudioBufferSourceNode | null = null;
  private gananciaReversa: GainNode | null = null;
  private buffersInvertidosCache = new Map<string, AudioBuffer>();
  // El buffer se guarda por separado del cache (que es por URL) para
  // no tener que volver a buscarlo en el Map en cada pausa/resume.
  private bufferReversaActual: AudioBuffer | null = null;
  // offsetReversaSegundos = cuánto del buffer YA se reprodujo antes de
  // la última pausa. tiempoInicioReversa = el reloj real del
  // AudioContext (currentTime) en el instante en que arrancó el
  // fragmento actual — la resta de ambos, en cualquier momento, da la
  // posición real exacta sin necesitar un setInterval propio.
  private offsetReversaSegundos = 0;
  private tiempoInicioReversa = 0;

  // Clave real de localStorage para mostrar el tooltip de "click
  // derecho para ampliar" una sola vez por navegador — dato de UI no
  // sensible, permitido guardar en cliente.
  private readonly CLAVE_HINT_VISTO = 'soulstation_hint_ampliar_visto';
  mostrarHintAmpliar = true;
  // Detectado una sola vez al iniciar: en pantallas táctiles no existe
  // un equivalente confiable de "click derecho" (el long-press que
  // dispara contextmenu varía entre navegadores móviles y no todos
  // los usuarios lo descubren solos) — por eso el botón de expandir
  // se vuelve más prominente/siempre visible en estos dispositivos.
  esDispositivoTactil = window.matchMedia('(pointer: coarse)').matches;

  constructor(
    private soulStationService: SoulStationService,
    private renderer: Renderer2,
    private toast: ToastService
  ) {
    this.mostrarHintAmpliar = !localStorage.getItem(this.CLAVE_HINT_VISTO);
  }

  ngAfterViewInit(): void {
    if (this.overlayCaratulaRef) {
      this.renderer.appendChild(document.body, this.overlayCaratulaRef.nativeElement);
    }
    if (this.overlayInmersivoRef) {
      this.renderer.appendChild(document.body, this.overlayInmersivoRef.nativeElement);
    }
    document.addEventListener('fullscreenchange', this.alCambiarFullscreen);
    // 40 partículas orbitando el centro — cada una con su propio
    // radio inicial, velocidad angular y desfase de color, para que
    // no se muevan todas en sincronía perfecta (look más orgánico).
    this.particulasPS1 = Array.from({ length: 40 }, () => ({
      angulo: Math.random() * Math.PI * 2,
      radio: 20 + Math.random() * 60,
      velocidad: 0.005 + Math.random() * 0.015,
      hueOffset: Math.random() * 360
    }));
  }

  ngOnInit(): void {
    this.soulStationService.obtenerEstacion().subscribe({
      next: (respuesta) => {
        this.nombreEstacion = respuesta.estacion.nombre;
        this.descripcionEstacion = respuesta.estacion.descripcion;
        this.playlist = [...respuesta.estacion.playlist].sort((a, b) => a.orden - b.orden);
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.frameVisualizadorId !== null) cancelAnimationFrame(this.frameVisualizadorId);
    this.detenerReversa();
    this.audioContext?.close();
    // Al destruir el componente (ej. navegar a otra ruta), el nodo
    // movido a document.body debe quitarse a mano — Angular ya no lo
    // controla automáticamente porque salió de su árbol de vistas.
    if (this.overlayCaratulaRef?.nativeElement.parentNode === document.body) {
      this.renderer.removeChild(document.body, this.overlayCaratulaRef.nativeElement);
    }
    if (this.overlayInmersivoRef?.nativeElement.parentNode === document.body) {
      this.renderer.removeChild(document.body, this.overlayInmersivoRef.nativeElement);
    }
    document.removeEventListener('fullscreenchange', this.alCambiarFullscreen);
    document.body.classList.remove('soul-scroll-bloqueado');
  }

  // Descarga el audio, lo decodifica a PCM (decodeAudioData, API real
  // de Web Audio) y devuelve un AudioBuffer con las muestras
  // invertidas — se cachea por URL para no re-descargar/re-invertir
  // la misma canción si el usuario activa reversa varias veces.
  private async obtenerBufferInvertido(url: string): Promise<AudioBuffer> {
    const cacheado = this.buffersInvertidosCache.get(url);
    if (cacheado) return cacheado;

    if (!this.audioContext) this.audioContext = new AudioContext();
    const respuesta = await fetch(url);
    const arrayBuffer = await respuesta.arrayBuffer();
    const bufferOriginal = await this.audioContext.decodeAudioData(arrayBuffer);

    // Un AudioBuffer no se puede invertir "in place" con métodos
    // nativos — se crea uno nuevo del mismo tamaño y se copia canal
    // por canal, muestra por muestra, en orden inverso (Float32Array,
    // getChannelData/copyToChannel son API real y documentada de MDN).
    const bufferInvertido = this.audioContext.createBuffer(
      bufferOriginal.numberOfChannels,
      bufferOriginal.length,
      bufferOriginal.sampleRate
    );
    for (let canal = 0; canal < bufferOriginal.numberOfChannels; canal++) {
      const datosOriginales = bufferOriginal.getChannelData(canal);
      const datosInvertidos = new Float32Array(datosOriginales.length);
      for (let i = 0; i < datosOriginales.length; i++) {
        datosInvertidos[i] = datosOriginales[datosOriginales.length - 1 - i];
      }
      bufferInvertido.copyToChannel(datosInvertidos, canal);
    }

    this.buffersInvertidosCache.set(url, bufferInvertido);
    return bufferInvertido;
  }

  // Toggle real de 3 estados: apagado -> reproduce desde 0; sonando ->
  // pausa (guarda posición real); pausado -> reanuda desde esa
  // posición exacta. Mismo patrón visual que togglePlayPause() normal,
  // pero con la complejidad extra de calcular el offset manualmente.
  async alternarReversa(): Promise<void> {
    if (this.reproduciendoReversa) {
      this.pausarReversa();
      return;
    }
    if (this.reversaPausada) {
      this.reanudarReversa();
      return;
    }
    if (!this.pistaActual) return;
    this.audioPlayerRef.nativeElement.pause();
    this.reproduciendo = false;
    this.cargandoReversa = true;
    try {
      const buffer = await this.obtenerBufferInvertido(this.pistaActual.url);
      this.bufferReversaActual = buffer;
      this.offsetReversaSegundos = 0;
      this.iniciarFuenteReversa(0);
    } catch {
      // Si falla la descarga/decodificación, la reversa simplemente
      // no arranca — el resto del reproductor sigue funcionando igual.
    } finally {
      this.cargandoReversa = false;
    }
  }
  // Crea y arranca un AudioBufferSourceNode nuevo desde `offsetInicial`
  // (segundos dentro del buffer invertido) — conectado a través de un
  // GainNode propio (gananciaReversa), independiente del volumen
  // normal, para poder graduarlo aparte como pediste.
  private iniciarFuenteReversa(offsetInicial: number): void {
    if (!this.audioContext || !this.bufferReversaActual) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
    this.gananciaReversa = this.audioContext.createGain();
    this.gananciaReversa.gain.value = this.volumenReversa;
    const fuente = this.audioContext.createBufferSource();
    fuente.buffer = this.bufferReversaActual;
    fuente.connect(this.gananciaReversa).connect(this.audioContext.destination);
    fuente.onended = () => {
      // Solo se considera "terminó de verdad" si no fue un stop()
      // manual por pausa — reversaPausada distingue ambos casos.
      if (!this.reversaPausada) {
        this.reproduciendoReversa = false;
        this.offsetReversaSegundos = 0;
      }
    };
    fuente.start(0, offsetInicial);
    this.fuenteReversa = fuente;
    this.tiempoInicioReversa = this.audioContext.currentTime;
    this.reproduciendoReversa = true;
    this.reversaPausada = false;
  }
  private pausarReversa(): void {
    if (!this.fuenteReversa || !this.audioContext) return;
    // Posición real = lo que ya se había acumulado antes + lo que
    // pasó desde que arrancó este fragmento (reloj real del
    // AudioContext, no un contador aproximado nuestro).
    this.offsetReversaSegundos += this.audioContext.currentTime - this.tiempoInicioReversa;
    this.reversaPausada = true;
    try {
      this.fuenteReversa.stop();
    } catch {
      // Ya se había detenido solo.
    }
    this.fuenteReversa = null;
    this.reproduciendoReversa = false;
  }
  private reanudarReversa(): void {
    this.iniciarFuenteReversa(this.offsetReversaSegundos);
  }
  cambiarVolumenReversa(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.volumenReversa = Math.min(Math.max(valor, 0), 1);
    if (this.gananciaReversa) this.gananciaReversa.gain.value = this.volumenReversa;
  }
  // Corte total (no pausa) — usado al cambiar de pista, donde no
  // tiene sentido "recordar" una posición de una canción distinta.
  detenerReversa(): void {
    if (this.fuenteReversa) {
      try {
        this.fuenteReversa.stop();
      } catch {
        // Ya se había detenido solo.
      }
      this.fuenteReversa = null;
    }
    this.reproduciendoReversa = false;
    this.reversaPausada = false;
    this.offsetReversaSegundos = 0;
    this.bufferReversaActual = null;
  }

  get pistaActual(): Pista | null {
    return this.playlist[this.indiceActual] ?? null;
  }

  // Control del flip 3D de la carátula — se resetea a false cada vez
  // que cambia la pista, para que la próxima carátula siempre arranque
  // mostrando el frente, no el respaldo de la anterior.
  caratulaVolteada = false;
  // Controla el overlay centrado en pantalla completa — activado con
  // click derecho (contextmenu), tanto desde la vista chica como desde
  // dentro del propio overlay (para volver a achicar).
  caratulaAmpliada = false;

  toggleFlipCaratula(): void {
    this.caratulaVolteada = !this.caratulaVolteada;
  }

  // preventDefault() evita que el navegador abra su menú contextual
  // nativo (click derecho) — lo usamos como gesto real para
  // ampliar/achicar, distinto del click izquierdo que voltea la carátula.
  toggleAmpliarCaratula(evento: Event): void {
    evento.preventDefault();
    this.caratulaAmpliada = !this.caratulaAmpliada;
    // Bloquea/libera el scroll del body mientras el modal está
    // abierto — clase CSS simple (overflow: hidden), técnica estándar
    // de cualquier modal real, evita que el fondo se desplace detrás.
    document.body.classList.toggle('soul-scroll-bloqueado', this.caratulaAmpliada);
    if (this.mostrarHintAmpliar) {
      this.mostrarHintAmpliar = false;
      localStorage.setItem(this.CLAVE_HINT_VISTO, '1');
    }
  }

  onMouseMoveCaratula(evento: MouseEvent): void {
    const el = evento.currentTarget as HTMLElement;
    const contenedor = el.getBoundingClientRect();
    const x = ((evento.clientX - contenedor.left) / contenedor.width) * 100;
    const y = ((evento.clientY - contenedor.top) / contenedor.height) * 100;
    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);
    // Tilt 3D real: rotación proporcional a la distancia del cursor
    // respecto al centro (0.5, 0.5) — mismo principio que usan
    // librerías reales de "tilt card" (ej. vanilla-tilt.js). El signo
    // invertido en rotateX hace que la esquina bajo el cursor se
    // "hunda" visualmente, mientras la opuesta parece levantarse.
    const centroX = (x - 50) / 50;
    const centroY = (y - 50) / 50;
    const maxGrados = 10;
    el.style.setProperty('--tilt-x', `${(-centroY * maxGrados).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(centroX * maxGrados).toFixed(2)}deg`);
  }
  // Al salir el mouse, la carátula vuelve a su posición neutral en vez
  // de quedar "trabada" en el último ángulo calculado.
  onMouseLeaveCaratula(evento: MouseEvent): void {
    const el = evento.currentTarget as HTMLElement;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }
  // Traduce el código real de licencia (URL de creativecommons.org
  // guardada en Mongo) a una descripción legal exacta — fuente:
  // definiciones oficiales de Creative Commons, no interpretación
  // propia. Cubre las 4 combinaciones reales que puede traer Jamendo:
  // by, by-sa, by-nc, by-nc-sa (esta última, aunque nunca debería
  // cargarse por el filtro de uso comercial, se documenta igual por
  // completitud del código).
  // Fuente: definiciones oficiales de Creative Commons. Se agregó el
  // caso 'publicdomain/zero' (CC0) que faltaba — Jamendo también aloja
  // tracks bajo dominio público, y el ejemplo real que trajiste
  // ("Believe in destiny") caía en ese caso, por eso mostraba el texto
  // genérico en vez de una descripción real y específica.
  get licenciaExplicada(): string {
    const url = this.pistaActual?.licencia ?? '';
    if (url.includes('publicdomain') || url.includes('zero')) return 'Dominio Público (CC0) — sin restricciones, uso comercial libre';
    if (url.includes('by-nc-sa')) return 'Atribución - No Comercial - Compartir Igual';
    if (url.includes('by-nc')) return 'Atribución - No Comercial';
    if (url.includes('by-sa')) return 'Atribución - Compartir Igual (uso comercial permitido)';
    if (url.includes('/by/')) return 'Atribución (uso comercial permitido)';
    return 'Licencia Creative Commons';
  }

  // Nombre legible del género, a partir del slug técnico guardado
  // (post-punk-dark-wave, etc.) definido por nosotros mismos al curar
  // — dato real de cómo se organizó la búsqueda, no inventado.
  get generoLegible(): string {
    const mapa: Record<string, string> = {
      'post-punk-dark-wave': 'Post-Punk / Dark Wave',
      'funk': 'Funk',
      'psicodelico-experimental': 'Psicodélico / Experimental',
      'rock': 'Rock',
      'hip-hop-old-school': 'Hip-Hop Old School',
      'city-pop-andino': 'City Pop / Andino'
    };
    return mapa[this.pistaActual?.categoria ?? ''] ?? 'Sin clasificar';
  }

  // Posición 1-based (index 0 = "canción 1", no "canción 0") — es lo
  // que espera ver un usuario real, no el índice interno de programación.
  get posicionEnLista(): number {
    return this.indiceActual + 1;
  }

  seleccionarPista(indice: number): void {
    this.indiceActual = indice;
    this.historialAleatorio = [indice];
    this.reproducir();
  }

  togglePlayPause(): void {
    if (this.reproduciendo) {
      this.audioPlayerRef.nativeElement.pause();
      this.reproduciendo = false;
    } else {
      this.reproducir();
    }
  }

  private reproducir(): void {
    this.detenerReversa();
    const audio = this.audioPlayerRef.nativeElement;
    // Reinicio explícito ANTES de cambiar el src — sin esto, durante
    // la fracción de segundo entre el cambio de pista y el evento
    // loadedmetadata de la nueva, duracionTotalSegundos seguía
    // mostrando el valor de la canción anterior (causa real del
    // tiempo "raro" al cambiar de pista).
    this.tiempoActualSegundos = 0;
    this.duracionTotalSegundos = 0;
    audio.crossOrigin = 'anonymous';
    audio.src = this.pistaActual?.url ?? '';
    audio.volume = this.volumen;
    this.asegurarCadenaAudio();
    audio.play();
    this.reproduciendo = true;
    this.iniciarVisualizador();
  }

  // Se conecta una sola vez (el AudioContext solo puede arrancar tras
  // un gesto real del usuario — política de autoplay de Chrome/Edge).
  // Encadena: fuente → [banda1 → banda2 → ... → bandaN] → analizador → salida.
  private asegurarCadenaAudio(): void {
    if (this.fuenteConectada) return;
    const audio = this.audioPlayerRef.nativeElement;
    this.audioContext = new AudioContext();

    const fuente = this.audioContext.createMediaElementSource(audio);

    this.filtrosEq = this.bandas.map((banda) => {
      const filtro = this.audioContext!.createBiquadFilter();
      filtro.type = banda.tipo;
      filtro.frequency.value = banda.frecuenciaHz;
      if (banda.tipo === 'peaking') filtro.Q.value = 1;
      filtro.gain.value = banda.ganancia;
      return filtro;
    });

    this.analizador = this.audioContext.createAnalyser();
    // fftSize más grande = más resolución real de frecuencias para
    // agrupar en escala logarítmica (ver mapeoLogaritmico más abajo).
    // smoothingTimeConstant (propiedad real y documentada del
    // AnalyserNode, MDN) promedia cada lectura con la anterior — sin
    // esto, el visualizador salta de golpe cuadro a cuadro; con 0.75
    // se mueve fluido, como un ecualizador profesional real.
    this.analizador.fftSize = 512;
    this.analizador.smoothingTimeConstant = 0.75;
    this.bufferTiempo = new Uint8Array(this.analizador.fftSize);
    this.bufferFrecuenciaExtra = new Uint8Array(this.analizador.frequencyBinCount);
    // GainNode real de boost — mismo patrón que en AudioLocalService,
    // conectado al FINAL de la cadena (después del EQ), antes del
    // analizador, para que el visualizador siga leyendo la señal real
    // que se escucha.
    this.gananciaBoost = this.audioContext.createGain();
    this.gananciaBoost.gain.value = 1;
    const cadenaCompleta: AudioNode[] = [fuente, ...this.filtrosEq, this.gananciaBoost, this.analizador, this.audioContext.destination];
    for (let i = 0; i < cadenaCompleta.length - 1; i++) {
      cadenaCompleta[i].connect(cadenaCompleta[i + 1]);
    }

    this.fuenteConectada = true;
  }

  cambiarBanda(indice: number, evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.bandas[indice].ganancia = valor;
    if (this.filtrosEq[indice]) this.filtrosEq[indice].gain.value = valor;
  }

  restaurarEcualizador(): void {
    this.bandas.forEach((banda, i) => {
      banda.ganancia = 0;
      if (this.filtrosEq[i]) this.filtrosEq[i].gain.value = 0;
    });
  }

  // Loop propio del visualizador — lee el espectro real del audio en
  // cada frame (getByteFrequencyData, API estándar) y alimenta AMBOS
  // renderizadores (barras LED y PS1) desde el mismo dato — nunca se
  // crea una segunda cadena de audio ni un segundo AnalyserNode.
  private iniciarVisualizador(): void {
    if (this.frameVisualizadorId !== null) return;
    const datos = new Uint8Array(this.analizador!.frequencyBinCount);
    const totalBins = datos.length;
    const totalBarras = this.barrasVisualizador.length;
    const dibujar = (timestamp: number) => {
      if (!this.analizador) return;
      this.analizador.getByteFrequencyData(datos);
      this.barrasVisualizador = this.barrasVisualizador.map((_, i) => {
        const inicio = Math.floor(Math.pow(i / totalBarras, 2) * totalBins);
        const fin = Math.max(inicio + 1, Math.floor(Math.pow((i + 1) / totalBarras, 2) * totalBins));
        let suma = 0;
        for (let bin = inicio; bin < fin && bin < totalBins; bin++) suma += datos[bin];
        const promedio = suma / Math.max(1, fin - inicio);
        return Math.max(2, (promedio / 255) * 100);
      });
      if (this.modoVisualizador === 'ps1') {
        this.dibujarPS1(this.canvasPS1Ref?.nativeElement, datos, timestamp, this.mousePS1X, this.mousePS1Y, false);
      }
      if (this.modoInmersivo) {
        this.dibujarKaleidoscopio(this.canvasInmersivoRef?.nativeElement, datos, timestamp, this.volumen);
      }
      this.frameVisualizadorId = requestAnimationFrame(dibujar);
    };
    this.frameVisualizadorId = requestAnimationFrame(dibujar);
  }

  // Extrae 3 bandas resumidas del espectro real (graves/medios/agudos)
  // — mismo espectro que ya se usa para las barras, solo agrupado
  // distinto: acá interesa la energía global de cada rango, no 28
  // valores individuales.
  private energiaPorRango(datos: Uint8Array): { graves: number; medios: number; agudos: number } {
    const tercio = Math.floor(datos.length / 3);
    const promedio = (desde: number, hasta: number) => {
      let suma = 0;
      for (let i = desde; i < hasta; i++) suma += datos[i];
      return suma / Math.max(1, hasta - desde) / 255;
    };
    return {
      graves: promedio(0, tercio),
      medios: promedio(tercio, tercio * 2),
      agudos: promedio(tercio * 2, datos.length)
    };
  }

  private dibujarPS1(
    canvas: HTMLCanvasElement | undefined,
    datos: Uint8Array,
    timestamp: number,
    mouseX: number,
    mouseY: number,
    esInmersivo: boolean
  ): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const anchoReal = canvas.clientWidth;
    const altoReal = canvas.clientHeight;
    if (canvas.width !== anchoReal * dpr) {
      canvas.width = anchoReal * dpr;
      canvas.height = altoReal * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const { graves, medios, agudos } = this.energiaPorRango(datos);
    ctx.fillStyle = esInmersivo ? 'rgba(4, 2, 10, 0.12)' : 'rgba(6, 4, 12, 0.18)';
    ctx.fillRect(0, 0, anchoReal, altoReal);
    // El mini panel (no inmersivo) ya NO sigue al mouse — se pidió
    // explícitamente centrado y estable, solo con el pulso del click
    // como interacción. El modo inmersivo sí conserva el parallax.
    const centroDestinoX = esInmersivo ? (mouseX || anchoReal / 2) : anchoReal / 2;
    const centroDestinoY = esInmersivo ? (mouseY || altoReal / 2) : altoReal / 2;
    const cx = anchoReal / 2 + (centroDestinoX - anchoReal / 2) * 0.15;
    const cy = altoReal / 2 + (centroDestinoY - altoReal / 2) * 0.15;
    this.pulsoPS1 = Math.max(0, this.pulsoPS1 - 0.02);
    const hueBase = (timestamp * 0.02) % 360;
    // 'lighter' (blend aditivo real, API estándar Canvas 2D) ahora se
    // aplica siempre, no solo en inmersivo — es la técnica real que
    // hace que los colores se sumen/mezclen en vez de taparse entre
    // sí, más vibrante e impactante como se pidió para el mini panel.
    ctx.globalCompositeOperation = 'lighter';
    const escalaGeometria = esInmersivo ? 1.8 : 1.35;
    const radioBase = Math.min(anchoReal, altoReal) * 0.14 * escalaGeometria;
    const anillos = esInmersivo ? 7 : 4;
    for (let anillo = 0; anillo < anillos; anillo++) {
      const radio = radioBase * (anillo + 1) * (0.85 + graves * 0.6) + this.pulsoPS1 * 60;
      ctx.beginPath();
      ctx.arc(cx, cy, radio, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(hueBase + anillo * 35) % 360}, 95%, 60%, ${0.5 - anillo * (0.5 / anillos)})`;
      ctx.lineWidth = esInmersivo ? 3 : 2;
      ctx.stroke();
    }
    const brazos = esInmersivo ? 5 : 3;
    for (let brazo = 0; brazo < brazos; brazo++) {
      ctx.beginPath();
      for (let t = 0; t < 1; t += 0.015) {
        const angulo = t * Math.PI * 6 + timestamp * (0.0006 + agudos * 0.002) + (brazo * Math.PI * 2) / brazos;
        const radio = t * Math.min(anchoReal, altoReal) * 0.48 * escalaGeometria * (0.6 + medios * 0.8);
        const x = cx + Math.cos(angulo) * radio;
        const y = cy + Math.sin(angulo) * radio;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${(hueBase + brazo * (360 / brazos)) % 360}, 95%, 65%, 0.55)`;
      ctx.lineWidth = esInmersivo ? 2.5 : 1.5;
      ctx.stroke();
    }
    const totalParticulas = esInmersivo ? this.particulasPS1.length : Math.floor(this.particulasPS1.length / 2);
    for (let i = 0; i < totalParticulas; i++) {
      const p = this.particulasPS1[i];
      p.angulo += p.velocidad * (1 + medios * 2);
      const radioReal = (p.radio + medios * 50) * escalaGeometria;
      const x = cx + Math.cos(p.angulo) * radioReal;
      const y = cy + Math.sin(p.angulo) * radioReal;
      ctx.beginPath();
      ctx.arc(x, y, (2 + graves * 3) * (esInmersivo ? 1.6 : 1), 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(hueBase + p.hueOffset) % 360}, 95%, 68%)`;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Caleidoscopio real: dibuja un solo "gajo" angular con las barras
  // de frecuencia real, y lo repite en espejo rotado alrededor del
  // centro N veces — técnica estándar de caleidoscopio digital, y
  // referencia verificada del comportamiento real de SoundScope
  // ("kaleidoscope graphics", confirmado en foros de la comunidad
  // retro que documentan el hardware original).
  private dibujarKaleidoscopio(canvas: HTMLCanvasElement | undefined, datos: Uint8Array, timestamp: number, volumen: number): void {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const anchoReal = canvas.clientWidth;
    const altoReal = canvas.clientHeight;
    if (canvas.width !== anchoReal * dpr) {
      canvas.width = anchoReal * dpr;
      canvas.height = altoReal * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.fillStyle = 'rgba(3, 2, 8, 0.05)';
    ctx.fillRect(0, 0, anchoReal, altoReal);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const cx = anchoReal / 2;
    const cy = altoReal / 2;
    const segmentos = 10;
    const anguloSegmento = (Math.PI * 2) / segmentos;
    // Factor real de volumen: escala TODO el conjunto — a volumen
    // bajo (0.2) el efecto ocupa una fracción chica de la pantalla;
    // a volumen máximo (1.0) combinado con audio fuerte, el radio
    // máximo llega a ~0.9 de la pantalla, tal como se pidió. Esto es
    // aparte del dato real de frecuencia (que sigue controlando cada
    // zona/banda por separado) — el volumen controla la ESCALA
    // GLOBAL, no una banda puntual.
    // Rango ampliado: a volumen 0 el efecto ocupa 0.3x su tamaño base;
    // a volumen máximo (1.0) llega a 2.0x — cumple el "x2 al tope"
    // pedido, combinado con la energía real de audio (que ya escala
    // cada efecto por su propia cuenta según el BiquadFilterNode de
    // cada banda del EQ).
    const factorVolumen = 0.3 + volumen * 1.7;
    const radioMax = Math.min(anchoReal, altoReal) * 0.55 * factorVolumen;

    // 'lighter' real (blend aditivo, Canvas 2D estándar): al dibujar
    // 2 capas desfasadas en el tiempo una encima de otra, sus colores
    // se SUMAN donde se solapan — eso es lo que produce la sensación
    // real de "los colores se entremezclan" en vez de 2 capas opacas
    // tapándose. Antes solo había 1 capa, por eso se sentía estático.
    ctx.globalCompositeOperation = 'lighter';
    const dibujarCapa = (desfaseTiempo: number, opacidadBase: number) => {
      const hueBase = (timestamp * 0.02 + desfaseTiempo) % 360;
      for (let s = 0; s < segmentos; s++) {
        ctx.save();
        ctx.translate(cx, cy);
        // Rotación continua y lenta de todo el sistema — antes era
        // estático salvo por el pulso de las barras, ahora fluye solo.
        ctx.rotate(s * anguloSegmento + timestamp * 0.00015);
        if (s % 2 === 1) ctx.scale(1, -1);
        const bandasEnGajo = 8;
        for (let b = 0; b < bandasEnGajo; b++) {
          const indiceBin = Math.floor((b / bandasEnGajo) * datos.length * 0.6);
          const valor = datos[indiceBin] / 255;
          const anguloInicio = (b / bandasEnGajo) * anguloSegmento;
          const anguloFin = ((b + 1) / bandasEnGajo) * anguloSegmento;
          // Radio con una pequeña onda senoidal propia (no solo el
          // valor de audio) — introduce un movimiento orgánico
          // continuo incluso en fragmentos de silencio momentáneo.
          const ondaPropia = Math.sin(timestamp * 0.001 + b) * 0.08;
          const radio = 20 + (valor + ondaPropia) * radioMax;
          // Hue continuo (sin Math.floor/cuantización) — el salto
          // brusco entre bandas era la causa real del look
          // "pixelado/bloqueado" — ahora el color varía suave y
          // continuo entre gajos, resultado fluido real.
          const hueContinuo = (hueBase + b * 20) % 360;
          const radioFinal = Math.max(1, radio);
          // Clamp real de alpha/luminosidad — con blend 'lighter' y 160
          // formas superpuestas (8 bandas x 10 segmentos x 2 capas), sin
          // techo la suma se saturaba a blanco puro, causa real de la
          // incandescencia que borraba los colores.
          // Techo bajado de 0.42 a 0.3 — combinado con el alpha base
          // reducido arriba, esto sí limita la suma acumulada real de
          // múltiples gajos superpuestos bajo 'lighter'.
          const alphaBase = Math.min(0.3, opacidadBase + valor * 0.35);
          const luminosidadGajo = Math.min(55, 50 + valor * 15);
          const gradienteGajo = ctx.createRadialGradient(0, 0, 0, 0, 0, radioFinal);
          gradienteGajo.addColorStop(0, `hsla(${hueContinuo}, 100%, ${luminosidadGajo}%, ${alphaBase})`);
          gradienteGajo.addColorStop(0.7, `hsla(${hueContinuo}, 100%, ${luminosidadGajo}%, ${alphaBase * 0.6})`);
          gradienteGajo.addColorStop(1, `hsla(${hueContinuo}, 100%, ${luminosidadGajo}%, 0)`);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radioFinal, anguloInicio, anguloFin);
          ctx.closePath();
          ctx.fillStyle = gradienteGajo;
          ctx.fill();
        }
        ctx.restore();
      }
    };
    // 2 capas desfasadas en color y tiempo, sumadas por 'lighter' —
    // es lo que da la sensación real de mezcla, no una sola capa sólida.
    const modo = this.modoEfectoFondoActual;
    if (modo === 'cuñas' || modo === 'completo') {
      // Causa real más profunda: con blend 'lighter', 2 capas x 8
      // bandas x 10 segmentos se SUMAN en RGB donde se solapan (pasa
      // todo el tiempo por diseño) — el clamp por-gajo anterior no
      // alcanzaba porque el problema es la suma acumulada, no un solo
      // gajo. Alpha base bajado a la mitad (0.28->0.14, 0.18->0.09)
      // reduce la saturación acumulada real sin cambiar el diseño.
      dibujarCapa(0, 0.14);
      dibujarCapa(140, 0.09);
    }
    if (modo === 'rayos' || modo === 'completo') {
      this.dibujarRayosSunburst(ctx, cx, cy, Math.min(anchoReal, altoReal) * factorVolumen, timestamp, datos);
    }
    if (modo === 'organico' || modo === 'completo') {
      this.dibujarContornoOrganico(ctx, cx, cy, Math.min(anchoReal, altoReal) * factorVolumen, timestamp, datos);
    }
    if (modo === 'osciloscopio') {
      this.dibujarOsciloscopio(ctx, anchoReal, altoReal);
    }
    if (modo === 'vortice' || modo === 'completo') {
      this.dibujarVortice(ctx, cx, cy, timestamp, factorVolumen, Math.min(anchoReal, altoReal));
    }
    // mandala/tunel/fractal quedan SOLO como modos individuales —
    // nunca se combinan en 'completo', a pedido explícito: cada uno
    // debe apreciarse solo, sin competir con los demás superpuestos.
    if (modo === 'mandala') {
      // Sin techo absoluto — a pedido explícito, algunos pétalos
      // pueden salirse de pantalla, el efecto real "estallido" gana
      // más que encapsularlo parejo en una burbuja.
      this.dibujarMandala(ctx, cx, cy, Math.min(anchoReal, altoReal) * factorVolumen, timestamp, datos);
    }
    if (modo === 'tunel') {
      this.dibujarTunelHipnotico(ctx, cx, cy, Math.min(anchoReal, altoReal) * factorVolumen, timestamp, datos);
    }
    if (modo === 'fractal') {
      this.dibujarFractalBurst(ctx, cx, cy, Math.min(anchoReal, altoReal) * factorVolumen, timestamp, datos);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Mandala: pétalos simétricos en varias capas concéntricas, cada
  // capa leyendo una zona distinta del espectro (graves = pétalos
  // internos grandes, agudos = pétalos externos finos) — desvanecido
  // real vía gradiente radial, mismo patrón ya usado en las cuñas.
  // Curva rosa real (r = cos(k·θ), matemática documentada de
  // spirógrafo/mandala) en vez de manchas de glow — trazo fino
  // rotando, cada capa con su propio número de pétalos (k) y color,
  // dando el look "línea hipnótica psicodélica" real en vez de
  // incandescente/borroso.
  // radioAbsolutoMax: techo duro en píxeles reales (mitad del lado
  // menor del canvas) — cada capa puede "dispararse" mucho más lejos
  // que antes (multiplicador propio por capa, look de estallido real),
  // pero Math.min contra este techo garantiza que ninguna cruce el
  // borde de pantalla, sin achicar el conjunto parejo como antes.
  // Cada punto de la curva ahora muestrea un bin de audio DISTINTO
  // (según su ángulo t) — antes toda la capa usaba un único `valor`
  // fijo, dando una curva pareja tipo "burbuja". Ahora cada pétalo
  // individual crece según su propia porción real del espectro,
  // pudiendo dispararse mucho más lejos que sus vecinos — sin ningún
  // techo absoluto, a pedido explícito.
  private dibujarMandala(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, timestamp: number, datos: Uint8Array): void {
    const capas = 5;
    for (let capa = 0; capa < capas; capa++) {
      const k = 3 + capa;
      const radioBase = escala * 0.4 * (0.85 + (capa / capas) * 0.4);
      const hue = (timestamp * 0.02 + capa * 45) % 360;
      const rotacion = timestamp * 0.00012 * (capa % 2 === 0 ? 1 : -1);
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.015) {
        const indiceBin = Math.floor(((t / (Math.PI * 2)) * 0.7 + capa / capas * 0.3) * (datos.length - 1));
        const valorPunto = datos[Math.max(0, Math.min(datos.length - 1, indiceBin))] / 255;
        const r = radioBase * (0.4 + valorPunto * 1.1) * Math.cos(k * t);
        const anguloFinal = t + rotacion;
        const x = cx + Math.cos(anguloFinal) * r;
        const y = cy + Math.sin(anguloFinal) * r;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${hue}, 100%, 62%, 0.42)`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  // Túnel hipnótico: anillos concéntricos que avanzan hacia afuera
  // (sensación de zoom infinito), cada anillo leyendo una franja de
  // frecuencia distinta — técnica real de "tunnel effect" con anillos
  // desfasados en el tiempo.
  private dibujarTunelHipnotico(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, timestamp: number, datos: Uint8Array): void {
    const anillos = 5;
    for (let a = 0; a < anillos; a++) {
      const fase = ((timestamp * 0.0004 + a / anillos) % 1);
      const radio = fase * escala * 0.5;
      const indiceBin = Math.floor((a / anillos) * datos.length * 0.6);
      const valor = datos[indiceBin] / 255;
      // Banda de matiz angosta (195-265: cian-azul-violeta) en vez de
      // rotación completa de 360° — antes se parecía demasiado al
      // arcoíris del mandala; ahora tiene identidad propia.
      const hue = 195 + ((timestamp * 0.015 + a * 20) % 70);
      const grosor = 2 + valor * 6;
      ctx.strokeStyle = `hsla(${hue}, 100%, 62%, ${(1 - fase) * (0.4 + valor * 0.4)})`;
      ctx.lineWidth = grosor;
      ctx.beginPath();
      ctx.arc(cx, cy, radio, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Fractal burst: ráfaga de triángulos que se repiten en 3 escalas
  // decrecientes por rayo (simula recursión fractal barata, sin
  // recursión real de funciones), reaccionando a agudos.
  private dibujarFractalBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, timestamp: number, datos: Uint8Array): void {
    const { agudos } = this.energiaPorRango(datos);
    const rayos = 10;
    for (let r = 0; r < rayos; r++) {
      const anguloBase = (r / rayos) * Math.PI * 2 + timestamp * 0.0005;
      const indiceBin = Math.floor((r / rayos) * datos.length * 0.5);
      const valor = datos[indiceBin] / 255;
      const hue = (timestamp * 0.04 + r * 36) % 360;
      for (let nivel = 0; nivel < 3; nivel++) {
        const distancia = escala * 0.1 * (nivel + 1) * (0.6 + valor * 0.8);
        const tam = escala * 0.05 * (1 - nivel * 0.28) * (0.5 + agudos);
        const x = cx + Math.cos(anguloBase) * distancia;
        const y = cy + Math.sin(anguloBase) * distancia;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, tam);
        // Bug real corregido: faltaba el paréntesis de cierre de
        // hsla(...) — el color quedaba inválido, y bajo el blend
        // 'lighter' con triángulos superpuestos eso producía
        // exactamente el efecto borroso/lavado reportado, no era
        // "incandescencia" del diseño.
        grad.addColorStop(0, `hsla(${hue}, 100%, 68%, ${0.5 - nivel * 0.12})`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 68%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y - tam);
        ctx.lineTo(x + tam * 0.87, y + tam * 0.5);
        ctx.lineTo(x - tam * 0.87, y + tam * 0.5);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Osciloscopio real: getByteTimeDomainData (API estándar de
  // AnalyserNode, MDN) devuelve la forma de onda en el TIEMPO, no en
  // frecuencia — es el modo nativo real de PS1 confirmado en fuentes
  // (osciloscopio de amplitud). Reutiliza el mismo this.analizador,
  // solo pide un dato distinto del mismo nodo.
  private dibujarOsciloscopio(ctx: CanvasRenderingContext2D, ancho: number, alto: number): void {
    if (!this.analizador || !this.bufferTiempo) return;
    const datosTiempo = this.bufferTiempo;
    this.analizador.getByteTimeDomainData(datosTiempo);
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    const paso = ancho / datosTiempo.length;
    for (let i = 0; i < datosTiempo.length; i++) {
      const v = datosTiempo[i] / 128.0;
      // Margen real del 85%: antes la onda tocaba borde a borde en
      // picos altos (y llegaba a 0/alto exactos), causa real del
      // amontonamiento visual reportado en los extremos.
      const y = alto / 2 + (v - 1) * (alto / 2) * 0.85;
      const x = i * paso;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Vórtice: espiral cuyo radio crece con el índice de muestra y el
  // ángulo con el tiempo — referencia real confirmada (patrón
  // documentado de vórtice/espiral de PS1), usa el mismo array de
  // frecuencia que ya alimenta los demás modos, sin datos nuevos.
  private dibujarVortice(ctx: CanvasRenderingContext2D, cx: number, cy: number, timestamp: number, factorVolumen: number, escala: number): void {
    if (!this.analizador || !this.bufferFrecuenciaExtra) return;
    const datos = this.bufferFrecuenciaExtra;
    this.analizador.getByteFrequencyData(datos);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    // Bug real corregido: antes el radio dependía solo de `i` (0-256)
    // sin relación al tamaño real del canvas — por eso era siempre
    // diminuto sin importar la resolución de pantalla. Ahora
    // `escalaRadio` normaliza el radio al tamaño real disponible.
    const escalaRadio = escala / 256;
    let hueVortice = 0;
    for (let i = 0; i < datos.length; i += 2) {
      const angulo = i * 0.1 + timestamp * 0.002;
      const radio = (datos[i] / 255) * (i * escalaRadio) * factorVolumen;
      const x = Math.cos(angulo) * radio;
      const y = Math.sin(angulo) * radio;
      hueVortice = (timestamp * 0.05 + i) % 360;
      // Piso mínimo de opacidad (0.15) — antes la fórmula llegaba a
      // 0 de opacidad en el 60% final del recorrido, causa real de
      // que se viera "negro total" (la mayor parte de la espiral era
      // literalmente invisible, no un problema de diseño). Grosor de
      // línea real (2-4px según intensidad de audio) en vez de
      // heredar el lineWidth de otro efecto anterior.
      const alphaVortice = Math.max(0.22, 0.92 - (i / datos.length) * 0.7);
      ctx.strokeStyle = `hsla(${hueVortice}, 100%, 65%, ${alphaVortice})`;
      ctx.lineWidth = 2 + (datos[i] / 255) * 2.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
  // Rayos rectos irradiando del centro — referencia real confirmada
  // en capturas del SoundScope (patrón de líneas finas divergentes,
  // más intensas en agudos).
  private dibujarRayosSunburst(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, timestamp: number, datos: Uint8Array): void {
    const { agudos } = this.energiaPorRango(datos);
    const totalRayos = 40;
    // 0.5 -> 0.6: alcance real un poco mayor a medida que sube el
    // volumen (escala ya incluye factorVolumen desde el llamador).
    const largoBase = escala * 0.6;
    for (let i = 0; i < totalRayos; i++) {
      const angulo = (i / totalRayos) * Math.PI * 2 + timestamp * 0.0002;
      const indiceBin = Math.floor((i / totalRayos) * datos.length * 0.5);
      const valor = datos[indiceBin] / 255;
      const largo = largoBase * (0.2 + valor * 0.8);
      const brillo = 75 + (i % 3) * 8;
      const xInicio = cx + Math.cos(angulo) * largoBase * 0.08;
      const yInicio = cy + Math.sin(angulo) * largoBase * 0.08;
      const xFin = cx + Math.cos(angulo) * largo;
      const yFin = cy + Math.sin(angulo) * largo;
      // Gradiente de trazo real (createLinearGradient) a lo largo del
      // propio rayo — opaco en el centro, transparente en la punta:
      // el difuminado se ALARGA en la dirección real del rayo, no un
      // blur genérico parejo en todos lados.
      const gradienteRayo = ctx.createLinearGradient(xInicio, yInicio, xFin, yFin);
      gradienteRayo.addColorStop(0, `hsla(210, 15%, ${brillo}%, ${0.22 + agudos * 0.45})`);
      gradienteRayo.addColorStop(1, `hsla(210, 15%, ${brillo}%, 0)`);
      ctx.strokeStyle = gradienteRayo;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xInicio, yInicio);
      ctx.lineTo(xFin, yFin);
      ctx.stroke();
    }
  }

  // Contorno orgánico tipo blob, solo trazo (sin relleno) — referencia
  // real confirmada en capturas del SoundScope: silueta cerrada
  // irregular que respira con el audio, típicamente en 2 tonos
  // superpuestos (verde/rosa en las capturas reales).
  private dibujarContornoOrganico(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, timestamp: number, datos: Uint8Array): void {
    const puntos = 24;
    const radioBase = escala * 0.22;
    [
      { hue: 145, desfase: 0, mult: 1 },
      { hue: 330, desfase: Math.PI / 6, mult: 0.85 }
    ].forEach((capa) => {
      ctx.beginPath();
      for (let i = 0; i <= puntos; i++) {
        const t = (i / puntos) * Math.PI * 2;
        const indiceBin = Math.floor((i / puntos) * datos.length * 0.4);
        const valor = datos[indiceBin] / 255;
        const radio = radioBase * capa.mult * (0.7 + valor * 0.5 + Math.sin(t * 3 + timestamp * 0.0008) * 0.1);
        const x = cx + Math.cos(t + capa.desfase) * radio;
        const y = cy + Math.sin(t + capa.desfase) * radio;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${capa.hue}, 100%, 65%, 0.55)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Glow del thumb del EQ que respira con la ganancia real de esa
  // banda — 0dB = sin glow, ±15dB = glow máximo, dando sensación
  // "viva" de reacción, no un slider estático inerte.
  glowBandaEq(ganancia: number): string {
    const intensidad = Math.min(1, Math.abs(ganancia) / 15);
    return `0 0 ${4 + intensidad * 10}px rgba(56, 189, 248, ${0.3 + intensidad * 0.5})`;
  }
  colorSegmentoInmersivo(indiceBanda: number, timestamp: number): string {
    const hue = (timestamp * 0.02 + indiceBanda * 45) % 360;
    return `hsl(${hue}, 90%, 62%)`;
  }

  // Familias REALMENTE distintas — basadas en química real de
  // combustión (verificable): azul = combustión completa/más
  // caliente (encendedor de butano, soplete), naranja/rojo =
  // combustión incompleta/más fría (leña, carbón, vela). Bandas
  // graves = fuego cálido tradicional; bandas agudas = llama de gas
  // azul — dando la variedad real pedida, no 7 tonos del mismo naranja.
  // Luminosidad subida en todos los tonos — la versión anterior era
  // demasiado oscura (casi invisible contra el fondo negro del EQ,
  // causa real de que "nunca prendiera"). Ahora cada nivel es
  // claramente visible incluso en ganancia baja.
  private readonly familiasLlamaPorBanda: { pálido: string; medio: string; intenso: string; nucleo: string }[] = [
    { pálido: '#a13a1a', medio: '#c9391a', intenso: '#ff5a2a', nucleo: '#ff9a5a' }, // Sub — brasa de carbón
    { pálido: '#c05a10', medio: '#d1550f', intenso: '#ff8a2a', nucleo: '#ffc98a' }, // Graves — fuego de leña
    { pálido: '#c08e0d', medio: '#d19a0b', intenso: '#ffcc2a', nucleo: '#ffe58a' }, // Med-Bajo — vela/ámbar
    { pálido: '#a3a30a', medio: '#c9c90c', intenso: '#f0f020', nucleo: '#fbfba0' }, // Medios — amarillo cálido
    { pálido: '#0f4a80', medio: '#1560a8', intenso: '#2a8ce0', nucleo: '#7ac9ff' }, // Med-Alto — llama de gas azul
    { pálido: '#0f6a90', medio: '#1585a8', intenso: '#2ac0d1', nucleo: '#a0f0ff' }, // Presencia — azul-cian intenso
    { pálido: '#1a3aa0', medio: '#2a4fc0', intenso: '#4a70ff', nucleo: '#c4d0ff' }  // Brillo — núcleo azul-blanco, más caliente
  ];

  // Color de cada segmento LED, ahora por banda: usa la familia de
  // tono propia de esa banda (arriba) y aplica la misma rampa de
  // intensidad tipo llama dentro de esa familia — pálido abajo/baja
  // ganancia, núcleo brillante en la punta activa cuando la ganancia
  // sube bastante, coherente con "cada barrita su propio patrón de
  // color, todas dentro de la paleta de fuego".
  colorSegmentoLlama(indiceBanda: number, indiceSegmento: number, ganancia: number): string {
    const familia = this.familiasLlamaPorBanda[indiceBanda % this.familiasLlamaPorBanda.length];
    const totalEncendidos = Math.round(((ganancia + 15) / 30) * this.segmentosPorColumna);
    const esPunta = indiceSegmento === totalEncendidos - 1;
    const progreso = indiceSegmento / this.segmentosPorColumna;
    if (esPunta && totalEncendidos > 2) return familia.nucleo;
    if (progreso < 0.35) return familia.pálido;
    if (progreso < 0.7) return familia.medio;
    return familia.intenso;
  }
  glowLlama(indiceSegmento: number, ganancia: number): string {
    const totalEncendidos = Math.round(((ganancia + 15) / 30) * this.segmentosPorColumna);
    const esPunta = indiceSegmento === totalEncendidos - 1;
    const intensidadGanancia = Math.abs(ganancia) / 15;
    // Glow base subido (5px en vez de 3px) — más presencia visual en
    // TODOS los segmentos encendidos, no solo un brillo casi nulo de
    // fondo; la punta sigue siendo la más intensa.
    // Doble sombra (glow cercano intenso + halo lejano más suave) —
    // técnica real de "double glow" para dar más presencia visual sin
    // depender solo del radio.
    const radio = esPunta ? 16 + intensidadGanancia * 12 : 7;
    return `0 0 ${radio * 0.5}px currentColor, 0 0 ${radio}px currentColor`;
  }
  // Confirma si un segmento es la "punta" activa de la llama — usado
  // para aplicar la clase de flicker/animación solo ahí (ver HTML),
  // en vez de que toda la columna parpadee sin sentido.
  esPuntaLlama(indiceSegmento: number, ganancia: number): boolean {
    const totalEncendidos = Math.round(((ganancia + 15) / 30) * this.segmentosPorColumna);
    return indiceSegmento === totalEncendidos - 1 && totalEncendidos > 2;
  }

  private elegirIndiceAleatorio(): number {
    if (this.playlist.length <= 1) return this.indiceActual;
    let candidato: number;
    do {
      candidato = Math.floor(Math.random() * this.playlist.length);
    } while (candidato === this.indiceActual);
    return candidato;
  }

  pistaSiguiente(): void {
    if (this.aleatorio) {
      this.indiceActual = this.elegirIndiceAleatorio();
      this.historialAleatorio.push(this.indiceActual);
    } else if (this.indiceActual < this.playlist.length - 1) {
      this.indiceActual++;
    } else {
      this.indiceActual = 0;
    }
    this.reproducir();
  }

  pistaAnterior(): void {
    if (this.aleatorio && this.historialAleatorio.length > 1) {
      this.historialAleatorio.pop();
      this.indiceActual = this.historialAleatorio[this.historialAleatorio.length - 1];
    } else if (this.indiceActual > 0) {
      this.indiceActual--;
    } else {
      this.indiceActual = this.playlist.length - 1;
    }
    this.reproducir();
  }

  alTerminarPista(): void {
    if (this.modoLoop === 'pista') {
      this.reproducir();
      return;
    }
    if (this.modoLoop === 'ninguno' && !this.aleatorio && this.indiceActual === this.playlist.length - 1) {
      this.reproduciendo = false;
      return;
    }
    this.pistaSiguiente();
  }

  alternarAleatorio(): void {
    this.aleatorio = !this.aleatorio;
    if (this.aleatorio) this.historialAleatorio = [this.indiceActual];
  }

  ciclarModoLoop(): void {
    const orden: ModoLoop[] = ['ninguno', 'lista', 'pista'];
    const indiceActualModo = orden.indexOf(this.modoLoop);
    this.modoLoop = orden[(indiceActualModo + 1) % orden.length];
  }

  cambiarVolumen(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.volumen = Math.min(Math.max(valor, 0), 1);
    if (this.audioPlayerRef?.nativeElement) {
      this.audioPlayerRef.nativeElement.volume = this.volumen;
    }
  }

  // Boost real por encima del 100% nativo — mismo patrón que el
  // reproductor local (GainNode + toast único por sesión). Se agrega
  // como control SEPARADO del volumen normal (que sigue yendo 0-1),
  // para no romper el comportamiento ya existente del slider actual.
  private gananciaBoost: GainNode | null = null;
  boostVolumen = 1;
  private avisoBoostMostrado = false;
  private readonly UMBRAL_AVISO_BOOST = 1.5;

  cambiarBoost(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.boostVolumen = valor;
    if (this.gananciaBoost) this.gananciaBoost.gain.value = valor;
    if (valor >= this.UMBRAL_AVISO_BOOST && !this.avisoBoostMostrado) {
      this.avisoBoostMostrado = true;
      this.toast.mostrar(
        'Volumen elevado por encima del nivel recomendado — cuidá tus oídos y tus parlantes.',
        'advertencia'
      );
    }
  }

  onTiempoActualizado(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    this.tiempoActualSegundos = audio.currentTime;
  }

  onMetadataCargada(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    this.duracionTotalSegundos = audio.duration || 0;
  }

  // Saltos de 10s reales — currentTime es propiedad estándar y
  // escribible de HTMLMediaElement (MDN); Math.max/min evita que el
  // salto se vaya antes de 0 o después del final real de la pista.
  avanzar10s(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  }
  retroceder10s(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }
  buscarPosicion(evento: Event): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    const nuevoTiempo = Number((evento.target as HTMLInputElement).value);
    audio.currentTime = nuevoTiempo;
    this.tiempoActualSegundos = nuevoTiempo;
  }

  get progresoPorcentaje(): number {
    if (!this.duracionTotalSegundos) return 0;
    return (this.tiempoActualSegundos / this.duracionTotalSegundos) * 100;
  }

  // Formato estándar M:SS. Devuelve "0:00" en vez de "NaN:NaN" cuando
  // el navegador aún no cargó la metadata del audio (Number.isFinite
  // descarta NaN e Infinity, ambos casos reales que audio.duration
  // puede devolver momentáneamente entre pistas).
  formatearDuracion(segundos: number): string {
    if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
    const totalRedondeado = Math.floor(segundos);
    const minutos = Math.floor(totalRedondeado / 60);
    const segundosRestantes = totalRedondeado % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }

  // Genera un array de índices [0, 1, 2, ...] del tamaño de
  // segmentosPorColumna, para poder iterarlo con *ngFor en el HTML y
  // dibujar cada segmento LED individual de una columna.
  get indicesSegmentos(): number[] {
    return Array.from({ length: this.segmentosPorColumna }, (_, i) => i);
  }

  // true si el segmento en la posición `indiceSegmento` (0 = abajo del
  // todo) debe estar "encendido" para la altura actual de esa barra —
  // convierte el porcentaje continuo (0-100) del visualizador en
  // pasos discretos, como un VU-meter real de consola.
  segmentoEncendido(alturaBarra: number, indiceSegmento: number): boolean {
    const segmentosEncendidos = Math.round((alturaBarra / 100) * this.segmentosPorColumna);
    return indiceSegmento < segmentosEncendidos;
  }

  // Color del segmento según su posición en la columna (0 = abajo).
  // Azul oscuro -> azul claro -> verde claro -> amarillo, de abajo
  // hacia arriba — mismo patrón que un VU-meter real (verde/amarillo/
  // rojo), adaptado a la paleta pedida.
  colorSegmento(indiceSegmento: number): string {
    const proporcion = indiceSegmento / this.segmentosPorColumna;
    if (proporcion < 0.35) return '#1e3a8a';
    if (proporcion < 0.65) return '#38bdf8';
    if (proporcion < 0.85) return '#4ade80';
    return '#facc15';
  }
}
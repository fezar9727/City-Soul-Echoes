import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SonidoZonaService } from '../../services/sonido-zona.service';

/** Una partícula de la llama del cohete — vive y muere en unos pocos
 * frames, con velocidad y opacidad propias, para simular el efecto de
 * despegue sin depender de ninguna librería externa. */
interface ParticulaLlama {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  vidaMaxima: number;
  radio: number;
}

const ALTO_THUMB = 46;
const TIEMPO_INACTIVIDAD_MS = 400;
const DURACION_ASENTAMIENTO_MS = 220;

@Component({
  selector: 'app-scroll-cohete',
  imports: [CommonModule],
  templateUrl: './scroll-cohete.component.html',
  styleUrl: './scroll-cohete.component.css'
})
export class ScrollCoheteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trackRef') trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  posicionThumbPx = 0;
  apuntaAbajo = true;
  arrastrando = false;
  opacidad = 1;
  // Ángulo acumulado (no solo 0/180 fijo) — cada cambio de dirección
  // suma o resta 180° sobre el valor actual, en vez de resetear a un
  // valor fijo. Así el navegador siempre anima desde donde está de
  // verdad hacia el nuevo ángulo, alternando el sentido del giro según
  // hacia dónde se mueve, en vez de girar siempre para el mismo lado.
    // Arranca en 180, no en 0 — apuntaAbajo también arranca en true (ver
  // arriba), y toda la lógica de la llama (yCola en dibujarFrame)
  // asume que apuntaAbajo=true significa "ya rotado 180°, apuntando
  // hacia abajo". Si esto arrancaba en 0, el cohete apuntaba hacia
  // arriba visualmente mientras la llama se dibujaba como si apuntara
  // hacia abajo — de ahí el desfase.
  rotacionAcumulada = 180;
  asentando = false;

  private alturaTrack = 0;
  private prefiereMovimientoReducido = false;
  private frameId: number | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private inactividadTimer: ReturnType<typeof setTimeout> | null = null;
  private scrolleandoActivo = false;
  private particulas: ParticulaLlama[] = [];
  private ultimoScrollY = 0;

  constructor(
    private zone: NgZone,
    private sonidoService: SonidoZonaService
  ) {}

  ngOnInit(): void {
    this.prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.ultimoScrollY = window.scrollY;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dimensionarTrackYCanvas();
      this.actualizarPosicionThumb();
      this.frameId = requestAnimationFrame((t) => this.loopDibujo(t));
      // pointermove/pointerup se registran manualmente (no con
      // @HostListener) porque necesitamos { passive: true } explícito:
      // Angular no expone esa opción en el decorador, y sin ella el
      // navegador asume que el listener podría llamar preventDefault(),
      // lo cual en dispositivos táctiles fuerza un cálculo de scroll más
      // costoso en cada frame — evitable marcándolo pasivo, ya que este
      // listener nunca bloquea el scroll nativo, solo lee la posición.
      this.zone.runOutsideAngular(() => {
        document.addEventListener('pointermove', this.onDocumentPointerMove, { passive: true });
        document.addEventListener('pointerup', this.onDocumentPointerUp, { passive: true });
      });
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.inactividadTimer) clearTimeout(this.inactividadTimer);
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    document.removeEventListener('pointerup', this.onDocumentPointerUp);
  }

  // ===================== Medición y posición =====================

  private dimensionarTrackYCanvas(): void {
    const track = this.trackRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!track || !canvas) return;

    this.alturaTrack = track.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = track.clientWidth * dpr;
    canvas.height = track.clientHeight * dpr;
    canvas.style.width = `${track.clientWidth}px`;
    canvas.style.height = `${track.clientHeight}px`;
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private obtenerAlturaScrolleable(): number {
    return Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  }

  private actualizarPosicionThumb(): void {
    const progreso = window.scrollY / this.obtenerAlturaScrolleable();
    const rangoDisponible = Math.max(this.alturaTrack - ALTO_THUMB, 0);
    this.posicionThumbPx = Math.min(Math.max(progreso, 0), 1) * rangoDisponible;
    this.actualizarOpacidad(progreso);
  }

  // El cohete se desvanece tanto al llegar arriba del todo (primer 6%
  // de scroll, donde ya no hay "arriba" hacia donde seguir subiendo)
  // como al llegar al final (último 6%, donde ya no hay "abajo") —
  // simetría real: no tiene sentido mostrarlo apuntando a un lugar al
  // que ya no se puede ir en esa dirección.
  private actualizarOpacidad(progreso: number): void {
    const ZONA_FADE = 0.06;
    if (progreso < ZONA_FADE) {
      this.opacidad = progreso / ZONA_FADE;
      return;
    }
    if (progreso > 1 - ZONA_FADE) {
      this.opacidad = (1 - progreso) / ZONA_FADE;
      return;
    }
    this.opacidad = 1;
  }

  // ===================== Scroll del navegador =====================

    @HostListener('window:scroll')
  onWindowScroll(): void {
    const actual = window.scrollY;
    const bajandoAhora = actual >= this.ultimoScrollY;
    // Solo gira si la dirección real cambió — evita sumar rotación de
    // más si sigue bajando/subiendo de corrido (que no debe girar más
    // allá del giro inicial hacia esa dirección).
    if (bajandoAhora !== this.apuntaAbajo) {
      // Siempre suma +180, nunca resta — así el ángulo crece sin
      // límite (180, 360, 540, 720...) en vez de oscilar solo entre
      // 0 y 180. Cada salto de 180° atraviesa un lado distinto del
      // giro (izquierda una vez, derecha la siguiente), dando el
      // efecto de alternar lados en vez de reversar el mismo camino.
      this.rotacionAcumulada += 180;
    }
    this.apuntaAbajo = bajandoAhora;
    this.ultimoScrollY = actual;
    this.actualizarPosicionThumb();
    this.marcarComoActivo();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.dimensionarTrackYCanvas();
      this.actualizarPosicionThumb();
    }, 150);
  }

  private marcarComoActivo(): void {
    if (!this.scrolleandoActivo) {
      this.sonidoService.reproducirMotor();
    }
    this.scrolleandoActivo = true;
    if (this.inactividadTimer) clearTimeout(this.inactividadTimer);
    this.inactividadTimer = setTimeout(() => {
      this.scrolleandoActivo = false;
      this.sonidoService.detenerMotor();
    }, TIEMPO_INACTIVIDAD_MS);
  }

  // ===================== Interacción — click y arrastre =====================
  // Pointer Events: misma API para mouse, touch y stylus en todos los
  // navegadores modernos (Chrome, Firefox, Safari, Edge) — evita tener
  // que manejar mousedown/touchstart por separado.

  onTrackPointerDown(evento: PointerEvent): void {
    this.saltarAPosicion(evento.clientY);
  }

  onThumbPointerDown(evento: PointerEvent): void {
    evento.stopPropagation();
    this.arrastrando = true;
    this.asentando = false;
    (evento.target as HTMLElement).setPointerCapture(evento.pointerId);
  }

  // Arrow function (no método de prototipo) para que 'this' quede
  // ligado correctamente al usarse con addEventListener directo, sin
  // necesidad de .bind(this) por separado.
  private onDocumentPointerMove = (evento: PointerEvent): void => {
    if (!this.arrastrando) return;
    this.saltarAPosicion(evento.clientY);
  };

  private onDocumentPointerUp = (): void => {
    if (!this.arrastrando) return;
    this.arrastrando = false;
    this.dispararAsentamiento();
  };

  private saltarAPosicion(clientY: number): void {
    const track = this.trackRef?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const relativo = (clientY - rect.top - ALTO_THUMB / 2) / Math.max(rect.height - ALTO_THUMB, 1);
    const progreso = Math.min(Math.max(relativo, 0), 1);
    // 'instant' explícito, no 'auto': el html global tiene
    // scroll-behavior: smooth (usado para la navegación por anclas del
    // navbar/minimapa), y 'auto' hereda ese smooth en cualquier
    // scrollTo — causaba que, al arrastrar rápido, el navegador siguiera
    // animando suavemente hacia la última posición después de soltar.
    // El arrastre necesita seguimiento 1:1 inmediato, sin animación.
    window.scrollTo({ top: progreso * this.obtenerAlturaScrolleable(), behavior: 'instant' });
  }

  // Micro-shake al soltar: breve "asentamiento" en vez de detenerse en
  // seco — sensación de inercia real. Se resuelve con una clase CSS de
  // vida corta (ver .asentando en el .css), no con JS calculando la
  // física del rebote — más liviano y consistente entre navegadores.
  private dispararAsentamiento(): void {
    if (this.prefiereMovimientoReducido) return;
    this.asentando = true;
    setTimeout(() => {
      this.zone.run(() => {
        this.asentando = false;
      });
    }, DURACION_ASENTAMIENTO_MS);
  }

  // ===================== Canvas — llama de despegue =====================

  private loopDibujo(timestamp: number): void {
    this.dibujarFrame();
    this.frameId = requestAnimationFrame((t) => this.loopDibujo(t));
  }

  private dibujarFrame(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const ancho = canvas.offsetWidth;
    const alto = canvas.offsetHeight;
    ctx.clearRect(0, 0, ancho, alto);

    if (this.prefiereMovimientoReducido) return;

    const centroX = ancho / 2;
    const yCola = this.apuntaAbajo
      ? this.posicionThumbPx + 4
      : this.posicionThumbPx + ALTO_THUMB - 4;

    if (this.scrolleandoActivo) {
      for (let i = 0; i < 2; i++) {
        this.particulas.push({
          x: centroX + (Math.random() - 0.5) * 8,
          y: yCola,
          vx: (Math.random() - 0.5) * 1.2,
          vy: this.apuntaAbajo ? -(1.5 + Math.random() * 2.5) : (1.5 + Math.random() * 2.5),
          vida: 0,
          vidaMaxima: 20 + Math.random() * 12,
          radio: 2.5 + Math.random() * 2.5
        });
      }
    }

    this.particulas = this.particulas.filter((p) => p.vida < p.vidaMaxima);
    this.particulas.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vida += 1;
      const progresoVida = p.vida / p.vidaMaxima;
      const alfa = 1 - progresoVida;

      const gradiente = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radio * (1 - progresoVida * 0.5));
      gradiente.addColorStop(0, `rgba(255, 240, 200, ${alfa})`);
      gradiente.addColorStop(0.5, `rgba(255, 90, 40, ${alfa * 0.8})`);
      gradiente.addColorStop(1, `rgba(200, 20, 20, 0)`);
      ctx.fillStyle = gradiente;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio * (1 - progresoVida * 0.5), 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
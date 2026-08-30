import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObrasService } from '../../services/obras.service';
import { Obra } from '../../models/obra.model';
import { RevealDirective } from '../../directives/reveal.directive';
import { ControlSonidoComponent } from '../control-sonido/control-sonido.component';
import { EfectoFondoSutilComponent } from '../efecto-fondo-sutil/efecto-fondo-sutil.component';
import { SonidoZonaService } from '../../services/sonido-zona.service';
import { RouterLink } from '@angular/router';

/** Un "cuadrito" del efecto de desintegración: guarda el recorte de la
 * imagen origen (sx,sy,sw,sh), la posición destino (x,y), la velocidad
 * de dispersión (vx,vy), un retraso individual para que no todos exploten
 * a la vez, y un ángulo de giro en Z para sumar profundidad al efecto. */
interface Cuadrito {
  sx: number; sy: number; sw: number; sh: number;
  x: number; y: number;
  vx: number; vy: number;
  retraso: number;
  anguloGiro: number;
}

const TAMANO_CUADRO = 70;
const DURACION_MS = 1700;
const AUTOPLAY_SEG = 22;

@Component({
  selector: 'app-vault',
    imports: [CommonModule, RevealDirective, ControlSonidoComponent, EfectoFondoSutilComponent],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit, OnDestroy {
  @ViewChild('lightboxImgRef') imgElRef!: ElementRef<HTMLImageElement>;
  @ViewChild('lightboxCanvasRef') canvasElRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barraFillRef') barraFillRef!: ElementRef<HTMLDivElement>;
  @ViewChild('miniaturasRef') miniaturasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('lightboxOverlayRef') overlayRef!: ElementRef<HTMLDivElement>;

  obras: Obra[] = [];
  lightboxAbierto = false;
  indiceActual = 0;
  srcImagenActual = '';

  private autoplayTimer: ReturnType<typeof setTimeout> | null = null;
  private pausado = false;
  private touchStartX = 0;
  private botonQueAbrio: HTMLElement | null = null;
  private animacionEnCurso = false;

  constructor(
    private obrasService: ObrasService,
    private sonidoService: SonidoZonaService
  ) {}

  ngOnInit(): void {
    this.obrasService.obtenerTodas().subscribe({
      next: (respuesta) => {
        this.obras = respuesta.obras;
      },
      error: () => {
        // Si el backend no responde, la sección queda vacía en vez de romper el sitio.
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
  }

  get obraActual(): Obra | undefined {
    return this.obras[this.indiceActual];
  }

  // ===================== Abrir / Cerrar =====================

  abrirLightbox(indice: number, evento?: Event): void {
    this.sonidoService.reproducirZona('vault');
    this.botonQueAbrio = (evento?.currentTarget as HTMLElement) ?? null;
    this.lightboxAbierto = true;
    document.body.style.overflow = 'hidden';
    this.pausado = false;
    this.mostrarObra(indice, true);
    setTimeout(() => this.overlayRef?.nativeElement.focus(), 0);
  }

  cerrarLightbox(): void {
    this.lightboxAbierto = false;
    document.body.style.overflow = '';
    this.detenerAutoplay();
    this.sonidoService.detenerActual();
    this.srcImagenActual = '';
    if (this.botonQueAbrio) {
      this.botonQueAbrio.focus();
      this.botonQueAbrio = null;
    }
  }

  // ===================== Navegación =====================

  irAnterior(): void {
    if (!this.obras.length) return;
    const nuevo = this.indiceActual === 0 ? this.obras.length - 1 : this.indiceActual - 1;
    this.mostrarObra(nuevo, false);
    this.reiniciarAutoplay();
  }

  irSiguiente(esAutomatico = false): void {
    if (!this.obras.length) return;
    const nuevo = this.indiceActual === this.obras.length - 1 ? 0 : this.indiceActual + 1;
    this.mostrarObra(nuevo, false);
    if (!esAutomatico) this.reiniciarAutoplay();
  }

  irAMiniatura(indice: number): void {
    this.mostrarObra(indice, false);
    this.reiniciarAutoplay();
  }

  private mostrarObra(indice: number, esPrimeraCarga: boolean): void {
    const obra = this.obras[indice];
    if (!obra) return;
    const srcAnterior = this.srcImagenActual;
    this.indiceActual = indice;
    this.reiniciarBarra();
    setTimeout(() => this.centrarMiniaturaActiva(), 0);

    if (esPrimeraCarga || !srcAnterior || this.animacionEnCurso) {
      // Primera apertura, o una transición ya en curso: sin efecto, directo.
      this.srcImagenActual = obra.imagenPortada;
      this.iniciarAutoplay();
      return;
    }
    this.desintegrarYReintegrar(srcAnterior, obra.imagenPortada);
  }

  private centrarMiniaturaActiva(): void {
    const contenedor = this.miniaturasRef?.nativeElement;
    if (!contenedor) return;
    const activa = contenedor.querySelector('.activa') as HTMLElement | null;
    activa?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }

  // ===================== Autoplay + barra de progreso =====================

  private iniciarAutoplay(): void {
    this.detenerAutoplay();
    if (this.pausado) return;
    this.autoplayTimer = setTimeout(() => {
      if (!this.pausado) this.irSiguiente(true);
    }, AUTOPLAY_SEG * 1000);
  }

  private detenerAutoplay(): void {
    if (this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private reiniciarAutoplay(): void {
    this.iniciarAutoplay();
  }

  pausarAutoplay(): void {
    this.pausado = true;
    this.detenerAutoplay();
    this.detenerBarra();
  }

  reanudarAutoplay(): void {
    this.pausado = false;
    this.reiniciarBarra();
    this.iniciarAutoplay();
  }

  private reiniciarBarra(): void {
    const fill = this.barraFillRef?.nativeElement;
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.transition = `width ${AUTOPLAY_SEG}s linear`;
      fill.style.width = '100%';
    }, 30);
  }

  private detenerBarra(): void {
    const fill = this.barraFillRef?.nativeElement;
    if (!fill) return;
    const anchoActual = fill.getBoundingClientRect().width;
    const anchoTotal = fill.parentElement?.getBoundingClientRect().width ?? 1;
    const pct = anchoTotal > 0 ? (anchoActual / anchoTotal) * 100 : 0;
    fill.style.transition = 'none';
    fill.style.width = `${pct}%`;
  }

  // ===================== Efecto Janemba 3D — Canvas =====================
  // Migración fiel del script.js original, potenciada con: (1) canvas
  // dimensionado con devicePixelRatio para nitidez real en pantallas
  // retina/4K, donde antes se veía borroso; (2) cada cuadrito gira
  // levemente en el eje Z mientras se dispersa, sumando profundidad al
  // efecto sin cambiar la lógica de retrasos y escala 3D ya diseñada.

  private desintegrarYReintegrar(srcVieja: string, srcNueva: string): void {
    const imgEl = this.imgElRef?.nativeElement;
    const canvas = this.canvasElRef?.nativeElement;
    if (!imgEl || !canvas) {
      this.srcImagenActual = srcNueva;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.srcImagenActual = srcNueva;
      return;
    }

    const imgTemp = new Image();
    imgTemp.crossOrigin = 'anonymous';
    imgTemp.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const anchoDisplay = imgEl.offsetWidth || 600;
      const altoDisplay = imgEl.offsetHeight || 400;

      canvas.width = anchoDisplay * dpr;
      canvas.height = altoDisplay * dpr;
      canvas.style.width = `${anchoDisplay}px`;
      canvas.style.height = `${altoDisplay}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const relacionContenedor = anchoDisplay / altoDisplay;
      const relacionImagen = imgTemp.width / imgTemp.height;
      let dw: number, dh: number, dx: number, dy: number;
      if (relacionImagen > relacionContenedor) {
        dw = anchoDisplay; dh = anchoDisplay / relacionImagen; dx = 0; dy = (altoDisplay - dh) / 2;
      } else {
        dh = altoDisplay; dw = altoDisplay * relacionImagen; dx = (anchoDisplay - dw) / 2; dy = 0;
      }

      ctx.clearRect(0, 0, anchoDisplay, altoDisplay);
      ctx.drawImage(imgTemp, dx, dy, dw, dh);
      imgEl.classList.add('desintegrando');
      canvas.style.opacity = '1';
      this.animacionEnCurso = true;

      const cols = Math.ceil(dw / TAMANO_CUADRO);
      const filas = Math.ceil(dh / TAMANO_CUADRO);
      const cuadritos: Cuadrito[] = [];
      for (let f = 0; f < filas; f++) {
        for (let c = 0; c < cols; c++) {
          cuadritos.push({
            sx: (c * TAMANO_CUADRO) * (imgTemp.width / dw),
            sy: (f * TAMANO_CUADRO) * (imgTemp.height / dh),
            sw: TAMANO_CUADRO * (imgTemp.width / dw),
            sh: TAMANO_CUADRO * (imgTemp.height / dh),
            x: dx + c * TAMANO_CUADRO,
            y: dy + f * TAMANO_CUADRO,
            vx: Math.random() * 12 - 6,
            vy: Math.random() * 10 - 5,
            retraso: Math.random() * 0.65,
            anguloGiro: (Math.random() - 0.5) * 1.4
          });
        }
      }

      let inicio: number | null = null;
      const animarDesintegracion = (timestamp: number): void => {
        if (inicio === null) inicio = timestamp;
        const progreso = Math.min((timestamp - inicio) / DURACION_MS, 1);
        ctx.clearRect(0, 0, anchoDisplay, altoDisplay);
        cuadritos.forEach((q) => {
          if (progreso < q.retraso) {
            ctx.drawImage(imgTemp, q.sx, q.sy, q.sw, q.sh, q.x, q.y, TAMANO_CUADRO, TAMANO_CUADRO);
            return;
          }
          const t = (progreso - q.retraso) / (1 - q.retraso);
          if (t >= 1) return;
          ctx.save();
          ctx.globalAlpha = 1 - t;
          const escala3D = 1 - t * 0.8;
          const posX = q.x + q.vx * t * 25;
          const posY = q.y + q.vy * t * 25;
          const tamanoFinal = TAMANO_CUADRO * escala3D;
          ctx.translate(posX + TAMANO_CUADRO / 2, posY + TAMANO_CUADRO / 2);
          ctx.rotate(q.anguloGiro * t);
          ctx.drawImage(imgTemp, q.sx, q.sy, q.sw, q.sh, -tamanoFinal / 2, -tamanoFinal / 2, tamanoFinal, tamanoFinal);
          ctx.restore();
        });

        if (progreso < 1) {
          requestAnimationFrame(animarDesintegracion);
          return;
        }

        ctx.clearRect(0, 0, anchoDisplay, altoDisplay);
        this.srcImagenActual = srcNueva;

        const imgNueva = new Image();
        imgNueva.onload = () => {
          inicio = null;
          const relacionImagenNueva = imgNueva.naturalWidth / imgNueva.naturalHeight;
          let dw2: number, dh2: number, dx2: number, dy2: number;
          if (relacionImagenNueva > relacionContenedor) {
            dw2 = anchoDisplay; dh2 = anchoDisplay / relacionImagenNueva; dx2 = 0; dy2 = (altoDisplay - dh2) / 2;
          } else {
            dh2 = altoDisplay; dw2 = altoDisplay * relacionImagenNueva; dx2 = (anchoDisplay - dw2) / 2; dy2 = 0;
          }
          const cols2 = Math.ceil(dw2 / TAMANO_CUADRO);
          const filas2 = Math.ceil(dh2 / TAMANO_CUADRO);
          const cuadritosNuevos: Cuadrito[] = [];
          for (let f = 0; f < filas2; f++) {
            for (let c = 0; c < cols2; c++) {
              cuadritosNuevos.push({
                sx: (c * TAMANO_CUADRO) * (imgNueva.naturalWidth / dw2),
                sy: (f * TAMANO_CUADRO) * (imgNueva.naturalHeight / dh2),
                sw: TAMANO_CUADRO * (imgNueva.naturalWidth / dw2),
                sh: TAMANO_CUADRO * (imgNueva.naturalHeight / dh2),
                x: dx2 + c * TAMANO_CUADRO,
                y: dy2 + f * TAMANO_CUADRO,
                vx: 0, vy: 0,
                retraso: Math.random() * 0.6,
                anguloGiro: (Math.random() - 0.5) * 1.4
              });
            }
          }

          const animarReintegracion = (ts: number): void => {
            if (inicio === null) inicio = ts;
            const progreso2 = Math.min((ts - inicio) / DURACION_MS, 1);
            ctx.clearRect(0, 0, anchoDisplay, altoDisplay);
            cuadritosNuevos.forEach((q) => {
              if (progreso2 <= q.retraso) return;
              const t = Math.min((progreso2 - q.retraso) / 0.4, 1);
              ctx.save();
              ctx.globalAlpha = t;
              const escala3D = 0.2 + t * 0.8;
              const tamanoFinal = TAMANO_CUADRO * escala3D;
              ctx.translate(q.x + TAMANO_CUADRO / 2, q.y + TAMANO_CUADRO / 2);
              ctx.rotate(q.anguloGiro * (1 - t));
              ctx.drawImage(imgNueva, q.sx, q.sy, q.sw, q.sh, -tamanoFinal / 2, -tamanoFinal / 2, tamanoFinal, tamanoFinal);
              ctx.restore();
            });

            if (progreso2 < 1) {
              requestAnimationFrame(animarReintegracion);
              return;
            }
            ctx.clearRect(0, 0, anchoDisplay, altoDisplay);
            canvas.style.opacity = '0';
            imgEl.classList.remove('desintegrando');
            this.animacionEnCurso = false;
            this.iniciarAutoplay();
          };
          requestAnimationFrame(animarReintegracion);
        };
        imgNueva.src = srcNueva;
      };
      requestAnimationFrame(animarDesintegracion);
    };
    imgTemp.onerror = () => {
      this.srcImagenActual = srcNueva;
      imgEl.classList.remove('desintegrando');
      canvas.style.opacity = '0';
      this.animacionEnCurso = false;
      this.iniciarAutoplay();
    };
    imgTemp.src = srcVieja;
  }

  // ===================== Teclado, foco y swipe =====================

  @HostListener('document:keydown', ['$event'])
  manejarTeclado(evento: KeyboardEvent): void {
    if (!this.lightboxAbierto) return;
    if (evento.key === 'Escape') this.cerrarLightbox();
    if (evento.key === 'ArrowLeft') this.irAnterior();
    if (evento.key === 'ArrowRight') this.irSiguiente();
    if (evento.key === 'Tab') this.atraparFoco(evento);
  }

  private atraparFoco(evento: KeyboardEvent): void {
    const overlay = this.overlayRef?.nativeElement;
    if (!overlay) return;
    const focosables = Array.from(
      overlay.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !(el as HTMLButtonElement).disabled && el.offsetParent !== null);
    if (!focosables.length) { evento.preventDefault(); return; }
    const primero = focosables[0];
    const ultimo = focosables[focosables.length - 1];
    if (evento.shiftKey) {
      if (document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      }
    } else if (document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  onOverlayClick(evento: MouseEvent): void {
    if (evento.target === this.overlayRef?.nativeElement) {
      this.cerrarLightbox();
    }
  }

  onTouchStart(evento: TouchEvent): void {
    this.touchStartX = evento.touches[0].clientX;
  }

  onTouchEnd(evento: TouchEvent): void {
    const diff = this.touchStartX - evento.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.irSiguiente() : this.irAnterior();
    }
  }
}
import { Directive, ElementRef, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';

interface Particula {
  x: number;
  y: number;
  radio: number;
  velocidadX: number;
  velocidadY: number;
  opacidad: number;
}

/**
 * Directiva reutilizable: pinta un canvas de fondo con partículas
 * flotantes detrás del contenido del elemento donde se aplica.
 * Soporta 2 modos visuales distintos ('flotante' y 'constelacion')
 * para que dos secciones vecinas (Aprendizaje y Artistas) se sientan
 * visualmente diferenciadas sin mantener dos motores de animación
 * separados — mismo código base, comportamiento configurable.
 */
@Directive({
  selector: '[appParticulasFondo]',
  standalone: true
})
export class ParticulasFondoDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() colorParticula = '255, 102, 204';
  @Input() cantidadParticulas = 45;
  @Input() modo: 'flotante' | 'constelacion' = 'flotante';

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particulas: Particula[] = [];
  private idAnimacion = 0;
  private observerResize?: ResizeObserver;

  constructor(private elementoAnfitrion: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const anfitrion = this.elementoAnfitrion.nativeElement;
    anfitrion.style.position = 'relative';
    anfitrion.style.overflow = 'hidden';

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';

    anfitrion.insertBefore(this.canvas, anfitrion.firstChild);

    const contexto = this.canvas.getContext('2d');
    if (!contexto) return;
    this.ctx = contexto;
  }

  ngAfterViewInit(): void {
    if (!this.ctx) return;
    this.ajustarTamaño();
    this.crearParticulas();
    this.animar();

    this.observerResize = new ResizeObserver(() => this.ajustarTamaño());
    this.observerResize.observe(this.elementoAnfitrion.nativeElement);
  }

  private ajustarTamaño(): void {
    const anfitrion = this.elementoAnfitrion.nativeElement;
    this.canvas.width = anfitrion.offsetWidth;
    this.canvas.height = anfitrion.offsetHeight;
  }

  private crearParticulas(): void {
    this.particulas = [];
    // 'flotante': partículas más grandes, más opacas y más rápidas que
    // la versión original — mucho más visibles a simple vista.
    // 'constelacion': partículas un poco más chicas, porque el efecto
    // visual fuerte ahí lo dan las líneas de conexión, no el punto solo.
    const radioBase = this.modo === 'constelacion' ? [1, 4] : [1.5, 5];
    const opacidadBase = this.modo === 'constelacion' ? [0.35, 0.7] : [0.4, 0.8];
    const velocidadBase = this.modo === 'constelacion' ? 0.25 : 0.5;
    const cantidadReal = this.modo === 'constelacion' ? Math.round(this.cantidadParticulas * 0.8) : this.cantidadParticulas;
    for (let i = 0; i < cantidadReal; i++) {
      this.particulas.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radio: Math.random() * (radioBase[1] - radioBase[0]) + radioBase[0],
        velocidadX: (Math.random() - 0.5) * velocidadBase,
        velocidadY: (Math.random() - 0.5) * velocidadBase,
        opacidad: Math.random() * (opacidadBase[1] - opacidadBase[0]) + opacidadBase[0]
      });
    }
  }

  private animar = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particulas.forEach((particula) => {
      particula.x += particula.velocidadX;
      particula.y += particula.velocidadY;

      if (particula.x < 0 || particula.x > this.canvas.width) particula.velocidadX *= -1;
      if (particula.y < 0 || particula.y > this.canvas.height) particula.velocidadY *= -1;

      this.ctx.beginPath();
      this.ctx.arc(particula.x, particula.y, particula.radio, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.colorParticula}, ${particula.opacidad})`;
      this.ctx.fill();

      // Halo de brillo alrededor de cada partícula — es lo que da la
      // sensación de "luz" en vez de simple punto plano.
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `rgba(${this.colorParticula}, 0.8)`;
    });

    // Modo constelación: dibuja una línea fina entre partículas que
    // están cerca entre sí, con opacidad decreciente según la distancia
    // — mismo efecto visual que popularizó particles.js.
    if (this.modo === 'constelacion') {
      const distanciaMaxima = 95;
      for (let i = 0; i < this.particulas.length; i++) {
        for (let j = i + 1; j < this.particulas.length; j++) {
          const dx = this.particulas[i].x - this.particulas[j].x;
          const dy = this.particulas[i].y - this.particulas[j].y;
          const distancia = Math.sqrt(dx * dx + dy * dy);
          if (distancia < distanciaMaxima) {
            const opacidadLinea = 0.25 * (1 - distancia / distanciaMaxima);
            this.ctx.beginPath();
            this.ctx.moveTo(this.particulas[i].x, this.particulas[i].y);
            this.ctx.lineTo(this.particulas[j].x, this.particulas[j].y);
            this.ctx.strokeStyle = `rgba(${this.colorParticula}, ${opacidadLinea})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      }
    }

    this.idAnimacion = requestAnimationFrame(this.animar);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.idAnimacion);
    this.observerResize?.disconnect();
  }
}
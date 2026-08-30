import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TipoEfectoFondo = 'arbol' | 'polvo' | 'manecillas' | 'paginas' | 'viento';

interface Petalo {
  x: number; y: number; vy: number;
  rotacion: number; velRot: number; tamano: number;
  opacidad: number; opacidadMax: number; colorIndice: number;
  cicloVida: number; duracionVida: number; fase: number;
}
interface Rama { x: number; y: number; largo: number; angulo: number; }
interface Farolillo {
  x: number; y: number; vy: number; fase: number;
  tamano: number; colorIndice: number;
  cicloVida: number; duracionVida: number;
}
interface CorrienteViento {
  y: number; fase: number; velocidad: number;
  amplitud: number; colorIndice: number;
  cicloVida: number; duracionVida: number;
}

// Neón real: 3 tonos por efecto, bien separados entre sí (no
// variaciones tenues del mismo color) y saturados al máximo, para
// que se distingan claramente uno de otro con el glow aplicado.
const PALETAS: Record<TipoEfectoFondo, string[]> = {
  arbol: ['255, 20, 147', '0, 255, 200', '255, 230, 0'],       // sakura: fucsia / turquesa / amarillo
  polvo: ['255, 200, 0', '0, 255, 100', '0, 200, 255'],         // shuriken: dorado / verde / cian
  manecillas: ['0, 220, 255', '180, 0, 255', '0, 255, 150'],    // seigaiha: cian / violeta / verde
  paginas: ['255, 60, 0', '255, 210, 0', '255, 0, 130'],        // chōchin: naranja / amarillo / magenta
  viento: ['0, 255, 255', '180, 60, 255', '255, 255, 255']      // corriente: cian / violeta / blanco
};

/**
 * 5 efectos de fondo, estilo sumi-e — trazoPincel() da variación real
 * de grosor y textura de tinta a cada trazo. Motivos: corriente de
 * viento fluida (Vault), racimo de sakura (Editar Perfil), seigaiha/
 * ola (Panel Eventos), farolillo chōchin (Panel Cursos), shuriken
 * (Panel Obras) — ninguno comparte silueta ni movimiento con otro.
 *
 * Colores neón reales (no pastel) + glow vía shadowBlur en las 5
 * formas, y reparto por ciclo 0-1-2 en petalos/shurikens para
 * garantizar tercio parejo de cada color, en vez de dejarlo al azar.
 */
@Component({
  selector: 'app-efecto-fondo-sutil',
  imports: [CommonModule],
  templateUrl: './efecto-fondo-sutil.component.html',
  styleUrl: './efecto-fondo-sutil.component.css'
})
export class EfectoFondoSutilComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) tipo!: TipoEfectoFondo;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private frameId: number | null = null;
  private petalos: Petalo[] = [];
  private farolillos: Farolillo[] = [];
  private corrientes: CorrienteViento[] = [];
  private ramas: Rama[] = [];
  private anchoActual = 0;
  private altoActual = 0;
  private sembrado = false;
  private mouseX = -1000;
  private mouseY = -1000;
  private contadorPetalo = 0;
  private contadorShuriken = 0;
  private contadorFarolillo = 0;
  private contadorCorriente = 0;

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(e: PointerEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.frameId = requestAnimationFrame((t) => this.loop(t));
  }
  ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  private medirYActualizar(): boolean {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return false;
    const anchoReal = window.innerWidth;
    const altoReal = window.innerHeight;
    if (anchoReal === this.anchoActual && altoReal === this.altoActual) return true;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = anchoReal * dpr;
    canvas.height = altoReal * dpr;
    canvas.style.width = `${anchoReal}px`;
    canvas.style.height = `${altoReal}px`;
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.anchoActual = anchoReal;
    this.altoActual = altoReal;
    return true;
  }

  private duracionParaVy(vy: number): number {
    return Math.max(200, (this.altoActual + 60) / Math.max(0.02, vy));
  }

  private crearPetalo(reciclado = true): Petalo {
    const vy = 0.045 + Math.random() * 0.04;
    // Ciclo 0-1-2: tercio parejo de cada color en vez de random puro,
    // que con pocas partículas favorece 1-2 colores por azar.
    const colorIndice = this.contadorPetalo % 3;
    this.contadorPetalo++;
    return {
      x: Math.random() * this.anchoActual,
      y: reciclado ? -20 : Math.random() * this.altoActual,
      vy,
      rotacion: Math.random() * Math.PI * 2,
      velRot: (Math.random() - 0.5) * 0.006,
      tamano: 5 + Math.random() * 3,
      opacidad: 0,
      opacidadMax: 0.26 + Math.random() * 0.1,
      colorIndice,
      cicloVida: 0,
      duracionVida: this.duracionParaVy(vy),
      fase: Math.random() * Math.PI * 2
    };
  }

  private crearShuriken(reciclado = true): Petalo {
    const vy = 0.12 + Math.random() * 0.1;
    const colorIndice = this.contadorShuriken % 3;
    this.contadorShuriken++;
    return {
      x: Math.random() * this.anchoActual,
      y: reciclado ? -20 : Math.random() * this.altoActual,
      vy,
      rotacion: Math.random() * Math.PI * 2,
      velRot: 0.02 + Math.random() * 0.03,
      tamano: 7 + Math.random() * 4,
      opacidad: 0,
      opacidadMax: 0.3 + Math.random() * 0.15,
      colorIndice,
      cicloVida: 0,
      duracionVida: this.duracionParaVy(vy),
      fase: Math.random() * Math.PI * 2
    };
  }

  private crearFarolillo(reciclado = true): Farolillo {
    const vy = -(0.03 + Math.random() * 0.03);
    // Mismo ciclo 0-1-2 que crearPetalo/crearShuriken — con solo 12
    // farolillos en pantalla, el random puro podía nunca sortear el
    // índice 2, dejando 1 de los 3 colores sin aparecer nunca (bug
    // real que reportaste en Panel Cursos).
    const colorIndice = this.contadorFarolillo % 3;
    this.contadorFarolillo++;
    return {
      x: Math.random() * this.anchoActual,
      y: reciclado ? this.altoActual + 20 : Math.random() * this.altoActual,
      vy,
      fase: Math.random() * Math.PI * 2,
      tamano: 10 + Math.random() * 6,
      colorIndice,
      cicloVida: 0,
      duracionVida: this.duracionParaVy(Math.abs(vy))
    };
  }

  private crearCorriente(reciclado = true): CorrienteViento {
    // Mismo ciclo 0-1-2 — solo 6 corrientes en pantalla, así que el
    // random puro tenía todavía más chance de dejar algún color fuera.
    const colorIndice = this.contadorCorriente % 3;
    this.contadorCorriente++;
    return {
      y: Math.random() * this.altoActual,
      fase: Math.random() * Math.PI * 2,
      velocidad: 0.0003 + Math.random() * 0.0003,
      amplitud: 35 + Math.random() * 45,
      colorIndice,
      cicloVida: 0,
      duracionVida: 900 + Math.random() * 700
    };
  }

  private sembrarInicial(): void {
    if (this.sembrado) return;
    this.sembrado = true;
    if (this.tipo === 'arbol') {
      [0.08, 0.5, 0.9].forEach((px) => {
        this.ramas.push({ x: px * this.anchoActual, y: 40 + Math.random() * 60, largo: 70 + Math.random() * 40, angulo: (Math.random() - 0.5) * 0.6 });
      });
      for (let i = 0; i < 22; i++) {
        const p = this.crearPetalo(false);
        p.cicloVida = Math.random() * p.duracionVida;
        this.petalos.push(p);
      }
    } else if (this.tipo === 'manecillas') {
      for (let i = 0; i < 20; i++) {
        const p = this.crearPetalo(false);
        p.cicloVida = Math.random() * p.duracionVida;
        this.petalos.push(p);
      }
    } else if (this.tipo === 'polvo') {
      for (let i = 0; i < 26; i++) {
        const p = this.crearShuriken(false);
        p.cicloVida = Math.random() * p.duracionVida;
        this.petalos.push(p);
      }
    } else if (this.tipo === 'paginas') {
      for (let i = 0; i < 12; i++) {
        const f = this.crearFarolillo(false);
        f.cicloVida = Math.random() * f.duracionVida;
        this.farolillos.push(f);
      }
    } else if (this.tipo === 'viento') {
      for (let i = 0; i < 6; i++) {
        const c = this.crearCorriente(false);
        c.cicloVida = Math.random() * c.duracionVida;
        this.corrientes.push(c);
      }
    }
  }

  private loop(timestamp: number): void {
    const listo = this.medirYActualizar();
    if (listo) {
      if (!this.sembrado) this.sembrarInicial();
      this.dibujarFrame(timestamp);
    }
    this.frameId = requestAnimationFrame((t) => this.loop(t));
  }

  private opacidadProgreso(ciclo: number, duracion: number, max: number): number {
    const p = ciclo / duracion;
    if (p < 0.12) return max * (p / 0.12);
    if (p > 0.88) return max * ((1 - p) / 0.12);
    return max;
  }

  private trazoPincel(ctx: CanvasRenderingContext2D, color: string, alfaBase: number, anchoBase: number, semilla: number, timestamp: number, path: () => void): void {
    const respiracion = Math.sin(semilla * 3 + timestamp * 0.0007) * 0.05;
    const capas = [
      { anchoMult: 2.2, alfaMult: 0.24, jitter: respiracion },
      { anchoMult: 1.3, alfaMult: 0.5, jitter: respiracion * 0.4 },
      { anchoMult: 0.55, alfaMult: 1, jitter: 0 }
    ];
    capas.forEach((capa) => {
      ctx.save();
      ctx.rotate(capa.jitter);
      ctx.strokeStyle = `rgba(${color}, ${Math.min(1, alfaBase * capa.alfaMult)})`;
      ctx.lineWidth = Math.max(0.4, anchoBase * capa.anchoMult);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      path();
      ctx.stroke();
      ctx.restore();
    });
  }

  private dibujarFrame(timestamp: number): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.anchoActual, this.altoActual);
    if (this.tipo === 'viento') { this.dibujarCorrienteViento(ctx, timestamp); return; }
    if (this.tipo === 'paginas') { this.dibujarFarolillos(ctx, timestamp); return; }
    if (this.tipo === 'arbol') this.dibujarRamas(ctx);

    const paleta = PALETAS[this.tipo];
    this.petalos.forEach((p) => {
      p.x += Math.sin(timestamp * 0.0009 + p.fase) * 0.3;
      p.y += p.vy;
      p.rotacion += p.velRot;
      p.cicloVida += 1;
      p.opacidad = this.opacidadProgreso(p.cicloVida, p.duracionVida, p.opacidadMax);
      if (this.tipo === 'polvo') p.opacidad *= 0.55 + 0.45 * Math.sin(timestamp * 0.006 + p.fase);
      if (p.cicloVida >= p.duracionVida || p.y > this.altoActual + 40) {
        Object.assign(p, this.tipo === 'polvo' ? this.crearShuriken(true) : this.crearPetalo(true));
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotacion);
      const color = paleta[p.colorIndice];
      const alfa = Math.max(0, p.opacidad);
      if (this.tipo === 'polvo') this.dibujarShuriken(ctx, p.tamano, color, alfa, p.fase, timestamp);
      else if (this.tipo === 'manecillas') this.dibujarOndaSeigaiha(ctx, p.tamano, color, alfa, p.fase, timestamp);
      else this.dibujarRacimoSakura(ctx, p.tamano, color, alfa, p.fase, timestamp);
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  private dibujarRamas(ctx: CanvasRenderingContext2D): void {
    const color = PALETAS['arbol'][2];
    this.ramas.forEach((r) => {
      ctx.save();
      this.trazoPincel(ctx, color, 0.32, 1.4, r.x * 0.01, 0, () => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        const fx = r.x + Math.cos(r.angulo) * r.largo;
        const fy = r.y + Math.sin(r.angulo) * r.largo;
        ctx.quadraticCurveTo(r.x + (fx - r.x) * 0.5, r.y - 18, fx, fy);
      });
      ctx.restore();
    });
  }

  private dibujarPetalo(ctx: CanvasRenderingContext2D, r: number, color: string, alfa: number, fase: number, timestamp: number): void {
    this.trazoPincel(ctx, color, alfa, 0.9, fase, timestamp, () => {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.7, 0, 0, r);
      ctx.quadraticCurveTo(-r * 0.7, 0, 0, -r);
    });
  }

  private dibujarRacimoSakura(ctx: CanvasRenderingContext2D, r: number, color: string, alfa: number, fase: number, timestamp: number): void {
    ctx.shadowColor = `rgb(${color})`;
    ctx.shadowBlur = 7;
    [0, 2.1, 4.2].forEach((offset) => {
      ctx.save();
      ctx.rotate(offset);
      ctx.translate(r * 0.5, 0);
      this.dibujarPetalo(ctx, r * 0.6, color, alfa, fase + offset, timestamp);
      ctx.restore();
    });
    ctx.shadowBlur = 0;
  }

  private dibujarOndaSeigaiha(ctx: CanvasRenderingContext2D, r: number, color: string, alfa: number, fase: number, timestamp: number): void {
    ctx.shadowColor = `rgb(${color})`;
    ctx.shadowBlur = 7;
    [1, 0.65, 0.35].forEach((escala, i) => {
      this.trazoPincel(ctx, color, alfa * (1 - i * 0.15), 0.7, fase + i, timestamp, () => {
        ctx.beginPath();
        ctx.arc(0, r * escala, r * escala, Math.PI, Math.PI * 2);
      });
    });
    ctx.shadowBlur = 0;
  }

  private dibujarShuriken(ctx: CanvasRenderingContext2D, r: number, color: string, alfa: number, fase: number, timestamp: number): void {
    ctx.shadowColor = `rgb(${color})`;
    ctx.shadowBlur = 8;
    this.trazoPincel(ctx, color, alfa, 1, fase, timestamp, () => {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI) * r, Math.sin(a + Math.PI) * r);
      }
    });
  }

  private dibujarFarolillos(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const paleta = PALETAS['paginas'];
    this.farolillos.forEach((f) => {
      f.y += f.vy;
      f.x += Math.sin(timestamp * 0.0006 + f.fase) * 0.25;
      f.cicloVida += 1;
      if (f.cicloVida >= f.duracionVida || f.y < -40) {
        Object.assign(f, this.crearFarolillo(true));
      }
      const opacidad = Math.max(0, this.opacidadProgreso(f.cicloVida, f.duracionVida, 0.22));
      const color = paleta[f.colorIndice];
      const r = f.tamano;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.shadowColor = `rgb(${color})`;
      ctx.shadowBlur = 8;
      this.trazoPincel(ctx, color, opacidad, 0.8, f.fase, timestamp, () => {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.65, r, 0, 0, Math.PI * 2);
      });
      [-0.4, 0, 0.4].forEach((off) => {
        this.trazoPincel(ctx, color, opacidad * 0.7, 0.5, f.fase + off, timestamp, () => {
          ctx.beginPath();
          ctx.moveTo(r * 0.65 * off, -r * 0.85);
          ctx.quadraticCurveTo(r * 0.65 * off * 1.4, 0, r * 0.65 * off, r * 0.85);
        });
      });
      this.trazoPincel(ctx, color, opacidad, 0.5, f.fase + 2, timestamp, () => {
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(0, -r * 1.3);
        ctx.moveTo(0, r); ctx.lineTo(0, r * 1.3);
      });
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  private dibujarCorrienteViento(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const paleta = PALETAS['viento'];
    this.corrientes.forEach((c) => {
      c.cicloVida += 1;
      if (c.cicloVida >= c.duracionVida) Object.assign(c, this.crearCorriente(true));
      const opacidad = Math.max(0.02, this.opacidadProgreso(c.cicloVida, c.duracionVida, 0.2));
      const color = paleta[c.colorIndice];

      const segmentos = 26;
      const puntos: { x: number; y: number }[] = [];
      for (let i = 0; i <= segmentos; i++) {
        const t = i / segmentos;
        const x = t * this.anchoActual;
        let y = c.y + Math.sin(t * Math.PI * 2 + timestamp * c.velocidad + c.fase) * c.amplitud;
        const dx = x - this.mouseX;
        const dy = y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const fuerza = (1 - dist / 220) * 55;
          const angulo = Math.atan2(dy, dx);
          y += Math.sin(angulo) * fuerza;
        }
        puntos.push({ x, y });
      }

      ctx.save();
      ctx.shadowColor = `rgb(${color})`;
      ctx.shadowBlur = 6;
      this.trazoPincel(ctx, color, opacidad, 0.7, c.fase, timestamp, () => {
        ctx.beginPath();
        ctx.moveTo(puntos[0].x, puntos[0].y);
        for (let i = 1; i < puntos.length - 1; i++) {
          const xc = (puntos[i].x + puntos[i + 1].x) / 2;
          const yc = (puntos[i].y + puntos[i + 1].y) / 2;
          ctx.quadraticCurveTo(puntos[i].x, puntos[i].y, xc, yc);
        }
      });
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }
}
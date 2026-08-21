import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface SeccionMapa {
  id: string;
  etiqueta: string;
  offsetTop: number;
  iconoSvg: SafeHtml;
}

const SECCIONES_CONFIG: { id: string; etiqueta: string }[] = [
  { id: 'inicio', etiqueta: 'Inicio' },
  { id: 'vault', etiqueta: 'The Vault' },
  { id: 'artistas', etiqueta: 'Muro Artistas' },
  { id: 'soul-station', etiqueta: 'Soul Station' },
  { id: 'eventos', etiqueta: 'Eventos' },
  { id: 'bienestar', etiqueta: 'Bienestar' },
  { id: 'aprendizaje', etiqueta: 'Aprendizaje' },
  { id: 'noticias', etiqueta: 'Artículos' },
  { id: 'sobre-creador', etiqueta: 'Bio' }
];

// Los SVG viven como texto plano acá, no como plantilla de Angular, para
// evitar un problema real del parser de @angular/compiler que no siempre
// interpreta bien el cambio a contexto SVG cuando queda anidado dentro de
// una estructura condicional (*ngSwitchCase). Se inyectan sanitizados con
// DomSanitizer — patrón oficial de Angular para HTML/SVG estático conocido
// y controlado por el propio código, no proveniente del usuario.
const ICONOS_SVG: Record<string, string> = {
  inicio: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  vault: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
    <ellipse cx="12" cy="12" rx="11" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(-20 12 12)"/>
  </svg>`,
  artistas: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
  </svg>`,
  'soul-station': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
  </svg>`,
  eventos: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 4 L17 9 L12 12 L7 14 L10 9 L15 6 Z"/>
    <path d="M12 12 L3 19 L9 15 Z" opacity="0.6"/>
    <path d="M10 13 L3 21 L7 17 Z" opacity="0.3"/>
  </svg>`,
  bienestar: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M12 2 Q14 6 12 10 Q10 14 12 22" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>`,
  aprendizaje: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="2" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="6" y1="6" x2="18" y2="2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="11" y1="10" x2="9" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="9" y1="20" x2="6" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="9" y1="20" x2="12" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  noticias: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3 L16 7 L20 9 L18 14 L14 18 L9 17 L5 13 L6 8 L10 5 Z"/>
  </svg>`,
  'sobre-creador': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9"/>
    <line x1="18" y1="6" x2="22" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
};

@Component({
  selector: 'app-minimapa',
  imports: [CommonModule],
  templateUrl: './minimapa.component.html',
  styleUrl: './minimapa.component.css'
})
export class MinimapaComponent implements OnInit, OnDestroy {
  secciones: SeccionMapa[] = [];
  seccionActivaId = '';

  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private tickingScroll = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (document.readyState === 'complete') {
      this.calcularPosiciones();
    } else {
      window.addEventListener('load', () => this.calcularPosiciones(), { once: true });
    }
  }

  ngOnDestroy(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  }

  private getOffsetTopAcumulado(el: HTMLElement): number {
    let top = 0;
    let elemento: HTMLElement | null = el;
    while (elemento) {
      top += elemento.offsetTop;
      elemento = elemento.offsetParent as HTMLElement | null;
    }
    return top;
  }

  private calcularPosiciones(): void {
    this.secciones = SECCIONES_CONFIG
      .map((config) => {
        const el = document.getElementById(config.id);
        if (!el) return null;
        return {
          id: config.id,
          etiqueta: config.etiqueta,
          offsetTop: this.getOffsetTopAcumulado(el),
          iconoSvg: this.sanitizer.bypassSecurityTrustHtml(ICONOS_SVG[config.id] ?? '')
        };
      })
      .filter((s): s is SeccionMapa => s !== null)
      .sort((a, b) => a.offsetTop - b.offsetTop);

    this.actualizarSeccionActiva();
  }

  private actualizarSeccionActiva(): void {
    const lineaActivacion = window.scrollY + window.innerHeight * 0.5;
    let idActivo = '';
    for (let i = this.secciones.length - 1; i >= 0; i--) {
      if (this.secciones[i].offsetTop <= lineaActivacion) {
        idActivo = this.secciones[i].id;
        break;
      }
    }
    this.seccionActivaId = idActivo;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.tickingScroll) return;
    this.tickingScroll = true;
    requestAnimationFrame(() => {
      this.actualizarSeccionActiva();
      this.tickingScroll = false;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.calcularPosiciones(), 150);
  }

  irASeccion(id: string, evento: Event): void {
    evento.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    this.vibrarSiEsTactil();
  }

  // Vibración breve al tocar un punto del minimapa — solo tiene efecto
  // real en dispositivos táctiles con hardware de vibración (celulares).
  // La API Vibration no existe para mouse de escritorio, por eso el
  // feature-detection: en desktop 'vibrate' in navigator es false y
  // este método simplemente no hace nada, sin errores ni efectos raros.
  private vibrarSiEsTactil(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }
}
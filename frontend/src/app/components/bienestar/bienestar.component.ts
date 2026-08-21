import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BienestarService } from '../../services/bienestar.service';
import { ItemBienestar, CategoriaBienestar } from '../../models/bienestar.model';
import { RevealDirective } from '../../directives/reveal.directive';
import { SonidoZonaService } from '../../services/sonido-zona.service';
import { ControlSonidoComponent } from '../../components/control-sonido/control-sonido.component';
type FiltroSaludMental = 'todos' | 'hablar-ya' | 'apoyo-especifico' | 'autocuidado';
@Component({
  selector: 'app-bienestar',
  imports: [CommonModule, RevealDirective, ControlSonidoComponent],
  templateUrl: './bienestar.component.html',
  styleUrl: './bienestar.component.css'
})
export class BienestarComponent implements OnInit {
  itemsVegana: ItemBienestar[] = [];
  itemsModa: ItemBienestar[] = [];
  itemsSaludMental: ItemBienestar[] = [];
  cargandoVegana = true;
  cargandoModa = true;
  cargandoSaludMental = true;
  categoriaAbierta: CategoriaBienestar | null = null;
  filtroSaludMentalActivo: FiltroSaludMental = 'todos';
  itemEnPantallaCompleta: ItemBienestar | null = null;

  constructor(
    private bienestarService: BienestarService,
    private sonidoService: SonidoZonaService
  ) {}

  ngOnInit(): void {
    this.cargarCategoria('vegana');
    this.cargarCategoria('moda-inclusiva');
    this.cargarCategoria('salud-mental');
  }

  private cargarCategoria(categoria: CategoriaBienestar): void {
    this.bienestarService.obtenerPorCategoria(categoria).subscribe({
      next: (respuesta) => {
        if (categoria === 'vegana') { this.itemsVegana = respuesta.items; this.cargandoVegana = false; }
        else if (categoria === 'moda-inclusiva') { this.itemsModa = respuesta.items; this.cargandoModa = false; }
        else { this.itemsSaludMental = respuesta.items; this.cargandoSaludMental = false; }
      },
      error: () => {
        if (categoria === 'vegana') this.cargandoVegana = false;
        else if (categoria === 'moda-inclusiva') this.cargandoModa = false;
        else this.cargandoSaludMental = false;
      }
    });
  }

  abrirCategoria(categoria: CategoriaBienestar): void {
    this.categoriaAbierta = categoria;
    this.filtroSaludMentalActivo = 'todos';
    if (categoria === 'vegana') this.sonidoService.reproducirZona('vegana');
    else if (categoria === 'moda-inclusiva') this.sonidoService.reproducirZona('moda');
    else if (categoria === 'salud-mental') this.sonidoService.reproducirZona('salud-mental');
  }

  cerrarCategoria(): void {
    this.categoriaAbierta = null;
    this.sonidoService.detenerActual();
  }
  // Bootstrap dispara este evento en su modal sin importar cómo se
  // cerró (botón X, click en el fondo oscuro, tecla Escape) — antes
  // solo el botón X llamaba a cerrarCategoria(), por eso el sonido
  // seguía sonando si cerrabas de otra forma. Documentado en la API
  // oficial de eventos de Bootstrap 5 (hidden.bs.modal).
  @HostListener('document:hidden.bs.modal')
  onModalCerrado(): void {
    this.cerrarCategoria();
  }

  aplicarFiltroSaludMental(filtro: FiltroSaludMental): void {
    this.filtroSaludMentalActivo = filtro;
  }

  abrirDetalleCompleto(item: ItemBienestar): void {
    this.itemEnPantallaCompleta = item;
  }

  cerrarDetalleCompleto(): void {
    this.itemEnPantallaCompleta = null;
  }

  get itemsDeCategoriaAbierta(): ItemBienestar[] {
    let items: ItemBienestar[] = [];
    if (this.categoriaAbierta === 'vegana') items = this.itemsVegana;
    else if (this.categoriaAbierta === 'moda-inclusiva') items = this.itemsModa;
    else if (this.categoriaAbierta === 'salud-mental') items = this.itemsSaludMental;

    if (this.categoriaAbierta === 'salud-mental' && this.filtroSaludMentalActivo !== 'todos') {
      return items.filter((item) => item.etiqueta === this.filtroSaludMentalActivo);
    }
    return items;
  }

  get tituloDeCategoriaAbierta(): string {
    if (this.categoriaAbierta === 'vegana') return 'Ruta Vegana en Cali';
    if (this.categoriaAbierta === 'moda-inclusiva') return 'Moda Inclusiva';
    if (this.categoriaAbierta === 'salud-mental') return 'Salud Mental';
    return '';
  }

  /**
   * Ícono decorativo del ítem (cabecera de la tarjeta sin imagen).
   * En moda-inclusiva delega en iconoEnlaceOficialDe() para que el ícono
   * dependa del tipo real de enlace (instagram | web | fuente), nunca
   * hardcodeado a Instagram.
   */
  iconoDeItem(item: ItemBienestar): string {
    if (this.categoriaAbierta === 'vegana') return 'bi-geo-alt-fill';
    if (this.categoriaAbierta === 'moda-inclusiva') return item.enlaceOficial ? this.iconoEnlaceOficialDe(item) : 'bi-book-half';
    if (this.categoriaAbierta === 'salud-mental') {
      if (item.etiqueta === 'hablar-ya') return 'bi-headset';
      if (item.etiqueta === 'apoyo-especifico') return 'bi-people-fill';
      return 'bi-sunrise-fill';
    }
    return 'bi-info-circle';
  }

  /**
   * Ícono del botón "Ver perfil" (enlaceOficial). Se basa exclusivamente
   * en tipoEnlaceOficial, nunca asume Instagram por defecto.
   */
  iconoEnlaceOficialDe(item: ItemBienestar): string {
    if (item.tipoEnlaceOficial === 'instagram') return 'bi-instagram';
    if (item.tipoEnlaceOficial === 'facebook') return 'bi-facebook';
    if (item.tipoEnlaceOficial === 'web') return 'bi-globe2';
    return 'bi-box-arrow-up-right';
  }

  claseIconoFondo(item: ItemBienestar): string {
    if (this.categoriaAbierta === 'vegana') return 'bienestar-item-sin-imagen--vegana';
    if (this.categoriaAbierta === 'moda-inclusiva') {
      return item.enlaceOficial
        ? `bienestar-item-sin-imagen--moda-${item.tipoEnlaceOficial ?? 'fuente'}`
        : 'bienestar-item-sin-imagen--moda-bio';
    }
    if (this.categoriaAbierta === 'salud-mental') return `bienestar-item-sin-imagen--${item.etiqueta}`;
    return '';
  }

  enlaceMapaDe(item: ItemBienestar): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.titulo} ${item.pais}`)}`;
  }

  enlaceLlamarDe(item: ItemBienestar): string {
    return `tel:${item.telefono}`;
  }

  enlaceWhatsappDe(item: ItemBienestar): string {
    return `https://wa.me/${item.whatsapp}`;
  }

  enlaceYoutubeDe(item: ItemBienestar): string {
    const consulta = encodeURIComponent(item.youtubeSearch || item.titulo);
    return `https://www.youtube.com/results?search_query=${consulta}`;
  }

  enlaceOficialConUtm(item: ItemBienestar): string {
  if (!item.enlaceOficial) return item.enlaceOficial;
  const separador = item.enlaceOficial.includes('?') ? '&' : '?';
  return `${item.enlaceOficial}${separador}utm_source=citysoulechoes&utm_medium=referral&utm_campaign=bienestar`;
}

  private claseFondoBioPorPais(pais: string): string {
    if (pais.includes('Wayuu')) return 'bienestar-overlay-pais-wayuu';
    if (pais === 'Colombia') return 'bienestar-overlay-pais-colombia';
    if (pais === 'Reino Unido') return 'bienestar-overlay-pais-reino-unido';
    if (pais === 'Canadá') return 'bienestar-overlay-pais-canada';
    if (pais === 'Estados Unidos') return 'bienestar-overlay-pais-eeuu';
    return '';
  }

  private claseFondoAutocuidado(item: ItemBienestar): string {
    const suma = item.titulo.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `bienestar-overlay-autocuidado-${suma % 3}`;
  }

  claseFondoOverlay(item: ItemBienestar): string {
    if (this.categoriaAbierta === 'moda-inclusiva') return this.claseFondoBioPorPais(item.pais);
    if (this.categoriaAbierta === 'salud-mental' && item.etiqueta === 'autocuidado') return this.claseFondoAutocuidado(item);
    return '';
  }

}
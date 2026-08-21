import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticulosService } from '../../services/articulos.service';
import { Articulo, CategoriaArticulo } from '../../models/articulo.model';
import { RevealDirective } from '../../directives/reveal.directive';
import { SonidoZonaService } from '../../services/sonido-zona.service';
import { ControlSonidoComponent } from '../../components/control-sonido/control-sonido.component';
@Component({
  selector: 'app-articulos',
  imports: [CommonModule, FormsModule, RevealDirective, ControlSonidoComponent],
  templateUrl: './articulos.component.html',
  styleUrl: './articulos.component.css'
})
export class ArticulosComponent implements OnInit {
  articulosNoticias: Articulo[] = [];
  articulosCultura: Articulo[] = [];
  articulosVideojuegos: Articulo[] = [];

  cargandoNoticias = true;
  cargandoCultura = true;
  cargandoVideojuegos = true;

  categoriaAbierta: CategoriaArticulo | null = null;
  textoBusqueda = '';

  // URLs de imágenes que fallaron al cargar — se usa para mostrar el
  // ícono de reemplazo en vez del ícono roto del navegador.
  private imagenesRotas = new Set<string>();

  constructor(
    private articulosService: ArticulosService,
    private sonidoService: SonidoZonaService
  ) {}

  ngOnInit(): void {
    this.cargarCategoria('noticias');
    this.cargarCategoria('cultura');
    this.cargarCategoria('videojuegos');
  }

  private cargarCategoria(categoria: CategoriaArticulo): void {
    this.articulosService.obtenerPorCategoria(categoria).subscribe({
      next: (respuesta) => {
        const lista = respuesta.articulos ?? [];
        if (categoria === 'noticias') {
          this.articulosNoticias = lista;
          this.cargandoNoticias = false;
        } else if (categoria === 'cultura') {
          this.articulosCultura = lista;
          this.cargandoCultura = false;
        } else {
          this.articulosVideojuegos = lista;
          this.cargandoVideojuegos = false;
        }
      },
      error: () => {
        if (categoria === 'noticias') this.cargandoNoticias = false;
        else if (categoria === 'cultura') this.cargandoCultura = false;
        else this.cargandoVideojuegos = false;
      }
    });
  }

  get articuloDestacado(): (categoria: CategoriaArticulo) => Articulo | null {
    return (categoria) => this.listaDeCategoria(categoria)[0] ?? null;
  }

  private listaDeCategoria(categoria: CategoriaArticulo): Articulo[] {
    if (categoria === 'noticias') return this.articulosNoticias;
    if (categoria === 'cultura') return this.articulosCultura;
    return this.articulosVideojuegos;
  }

  abrirCategoria(categoria: CategoriaArticulo): void {
    this.categoriaAbierta = categoria;
    this.textoBusqueda = '';
    this.sonidoService.reproducirZona(categoria);
  }

  cerrarCategoria(): void {
    this.categoriaAbierta = null;
    this.sonidoService.detenerActual();
  }
  @HostListener('document:hidden.bs.modal')
  onModalCerrado(): void {
    this.cerrarCategoria();
  }

  get tituloDeCategoriaAbierta(): string {
    if (this.categoriaAbierta === 'noticias') return 'Noticias';
    if (this.categoriaAbierta === 'cultura') return 'Cultura';
    if (this.categoriaAbierta === 'videojuegos') return 'Videojuegos';
    return '';
  }

  get articulosFiltrados(): Articulo[] {
    if (!this.categoriaAbierta) return [];
    const lista = this.listaDeCategoria(this.categoriaAbierta);
    const busqueda = this.textoBusqueda.trim().toLowerCase();
    if (!busqueda) return lista;
    return lista.filter((articulo) =>
      articulo.titulo?.toLowerCase().includes(busqueda) ||
      articulo.descripcion?.toLowerCase().includes(busqueda)
    );
  }

  // Se usa en TODAS las cards (destacadas y del modal) — un solo lugar
  // que define el recorte de texto, sin repetir lógica.
  descripcionCorta(texto: string, maximo: number = 150): string {
    if (!texto) return '';
    if (texto.length <= maximo) return texto;
    return texto.slice(0, maximo).trim() + '...';
  }

  // Marca una URL como rota cuando el navegador no logra cargarla.
  marcarImagenRota(url: string): void {
    this.imagenesRotas.add(url);
  }

  // Verdadero si hay que mostrar el ícono de reemplazo (sin imagen,
  // o imagen que ya falló al cargar antes).
  imagenNoDisponible(articulo: Articulo): boolean {
    return !articulo.urlImagen || this.imagenesRotas.has(articulo.urlImagen);
  }

  iconoFallbackDe(categoria: CategoriaArticulo): string {
    if (categoria === 'noticias') return 'bi-newspaper';
    if (categoria === 'cultura') return 'bi-palette-fill';
    return 'bi-controller';
  }

  claseFallbackDe(categoria: CategoriaArticulo): string {
    return `articulo-imagen-fallback--${categoria}`;
  }
}
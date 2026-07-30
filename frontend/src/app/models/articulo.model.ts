// Espejo exacto de NoticiaCache.js (backend/models/NoticiaCache.js)
// Ojo: a diferencia de Obras/Eventos/Cursos/Bienestar, este endpoint
// devuelve el documento de Mongo directo, SIN el wrapper { ok, ... }.

export interface Articulo {
  titulo: string;
  descripcion: string;
  url: string;
  urlImagen: string;
  fuente: string;
  fechaPublicacion: string;
}

export type CategoriaArticulo = 'noticias' | 'cultura' | 'videojuegos';

export interface RespuestaNoticias {
  categoria: CategoriaArticulo;
  articulos: Articulo[];
  fechaActualizacion: string;
}
export interface EnlaceReferencia {
  nombre: string;
  url: string;
}

export interface ItemBienestar {
  titulo: string;
  descripcion: string;
  detalleCompleto?: string;
  enlaceProfundizar?: string;
  youtubeSearch?: string;
  enlacesReferencia?: EnlaceReferencia[];
  imagenUrl: string;
  enlaceOficial: string;
  tipoEnlaceOficial?: 'instagram' | 'facebook' | 'web' | 'fuente';
  pais: string;
  etiqueta?: string;
  telefono?: string;
  whatsapp?: string;
}

export type CategoriaBienestar = 'vegana' | 'salud-mental' | 'moda-inclusiva';

export interface RespuestaBienestar {
  ok: boolean;
  categoria: CategoriaBienestar;
  items: ItemBienestar[];
  fuente: 'cache' | 'api' | 'cache-vencido' | 'curado';
}
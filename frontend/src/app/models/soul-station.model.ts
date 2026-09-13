export interface Pista {
  titulo: string;
  artista: string;
  url: string;
  imagenAlbum: string;
  categoria: string;
  licencia: string;
  duracionSegundos: number;
  orden: number;
}

export interface SoulStation {
  _id: string;
  nombre: string;
  descripcion: string;
  enVivo: boolean;
  linkTransmision: string;
  playlist: Pista[];
  pistaActual: number;
  activo: boolean;
  admin: string;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaSoulStation {
  ok: boolean;
  estacion: SoulStation;
}
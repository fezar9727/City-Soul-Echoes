// Espejo exacto del modelo Evento.js de Mongoose (backend/models/Evento.js)

export interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  tipo: 'evento' | 'viernes-cultural';
  fecha: string;
  hora: string;
  linkSala: string;
  accesoPúblico: boolean;
  cupos: number;
  activo: boolean;
  imagenPortada: string;
  imagenPortadaPublicId: string;
  creador: string;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaEventos {
  ok: boolean;
  total: number;
  eventos: Evento[];
}

export interface RespuestaViernesCulturales {
  ok: boolean;
  total: number;
  viernes: Evento[];
}

export interface RespuestaEvento {
  ok: boolean;
  evento: Evento;
}
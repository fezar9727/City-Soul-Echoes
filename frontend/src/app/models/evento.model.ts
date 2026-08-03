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
  eliminada: boolean;
  fechaEliminacion: string | null;
  estadoModeracion: 'aprobado' | 'pendiente' | 'rechazado';
  motivoRechazo: string;
  esOficial: boolean;
  imagenPortada: string;
  imagenPortadaPublicId: string;
  creador: string | { _id: string; nombreCompleto: string; correo?: string };
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaModeracion {
  ok: boolean;
  mensaje: string;
  evento: Evento;
}

export interface RespuestaEventos {
  ok: boolean;
  total: number;
  eventos: Evento[];
}

export interface RespuestaEvento {
  ok: boolean;
  evento: Evento;
}

export interface EventoPapelera extends Evento {
  diasRestantes: number;
}

export interface RespuestaPapeleraEventos {
  ok: boolean;
  total: number;
  eventos: EventoPapelera[];
}
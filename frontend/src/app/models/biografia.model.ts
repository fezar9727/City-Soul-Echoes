export interface Parrafo {
  texto: string;
  orden: number;
}

export interface Biografia {
  nombreCompleto: string;
  edad: number;
  parrafos: Parrafo[];
}

export interface RespuestaBiografia {
  ok: boolean;
  biografia: Biografia;
}
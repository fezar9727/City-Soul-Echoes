export interface Usuario {
  _id: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  ciudad?: string;
  bio?: string;
  avatarUrl?: string;
  rol: 'usuario' | 'artista' | 'docente' | 'admin';
  activo: boolean;
  puedeVender?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaAuth {
  ok: boolean;
  token: string;
  usuario: Usuario;
}

export interface CredencialesLogin {
  correo: string;
  password: string;
}

export interface DatosRegistroUsuario {
  nombreCompleto: string;
  correo: string;
  password: string;
  telefono?: string;
  ciudad?: string;
}
export interface RedesPerfil {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  whatsapp?: string;
  portafolioExterno?: string;
}

export interface PerfilArtista {
  nombreArtistico: string;
  bio: string;
  disciplinas: string[];
  metodoContacto: 'correo' | 'instagram' | 'facebook' | 'whatsapp';
  redes: RedesPerfil;
}

export interface PerfilDocente {
  nombrePublico: string;
  especialidad: string;
  bio: string;
  experiencia: string;
  modalidad: 'virtual' | 'presencial' | 'mixta';
  metodoContacto: 'correo' | 'instagram' | 'facebook' | 'whatsapp';
  redes: RedesPerfil;
}

export interface PerfilPublico {
  _id: string;
  nombreCompleto: string;
  correo: string;
  rol: 'artista' | 'docente';
  ciudad: string;
  perfilArtista?: PerfilArtista;
  perfilDocente?: PerfilDocente;
  createdAt: string;
}

export interface RespuestaPerfilPublico {
  ok: boolean;
  usuario: PerfilPublico;
}
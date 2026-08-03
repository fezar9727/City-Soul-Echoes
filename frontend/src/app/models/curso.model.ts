export interface DocentePopulado {
  _id: string;
  nombreCompleto: string;
  correo: string;
  perfilDocente?: {
    nombrePublico?: string;
    especialidad?: string;
    bio?: string;
    metodoContacto?: 'correo' | 'instagram' | 'facebook' | 'whatsapp';
    redes?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
    };
  };
}

export interface Leccion {
  titulo: string;
  descripcion: string;
  duracionMinutos: number;
  orden: number;
}

export interface Curso {
  _id: string;
  titulo: string;
  descripcion: string;
  categoria: 'arte' | 'escultura' | 'musica' | 'digital' | 'fotografia' | 'emprendimiento' | 'bienestar' | 'otro';
  modalidad: 'virtual' | 'presencial' | 'mixta';
  precio: number;
  duracionHoras: number;
  imagenPortada: string;
  imagenPortadaPublicId: string;
  lecciones: Leccion[];
  publicado: boolean;
  eliminada: boolean;
  fechaEliminacion: string | null;
  docente: string | DocentePopulado;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaCursos {
  ok: boolean;
  total: number;
  cursos: Curso[];
}

export interface RespuestaCurso {
  ok: boolean;
  curso: Curso;
}

export interface CursoPapelera extends Curso {
  diasRestantes: number;
}

export interface RespuestaPapeleraCursos {
  ok: boolean;
  total: number;
  cursos: CursoPapelera[];
}
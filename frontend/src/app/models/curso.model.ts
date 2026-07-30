// Espejo exacto del modelo Curso.js de Mongoose (backend/models/Curso.js)
export interface Leccion {
  titulo: string;
  descripcion: string;
  duracionMinutos: number;
  orden: number;
}

// Representa el docente cuando el backend devuelve el documento poblado
export interface DocentePopulado {
  _id: string;
  nombreCompleto: string;
  perfilDocente?: {
    nombrePublico?: string;
    especialidad?: string;
    bio?: string;
  };
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
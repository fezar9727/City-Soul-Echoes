// Espejo exacto del modelo Obra.js de Mongoose (backend/models/Obra.js)
// Tipado estricto: cada campo refleja el schema real, nada de `any`.

export interface ImagenObra {
  src: string;
  titulo: string;
  tituloEn: string;
  desc: string;
}

export interface Obra {
  _id: string;
  titulo: string;
  tituloEn: string;
  descripcion: string;
  serie: string;
  precio: number;
  categoria: 'pintura' | 'escultura' | 'musica' | 'digital' | 'fotografia' | 'otro';
  imagenPortada: string;
  imagenPortadaPublicId: string;
  imagenes: ImagenObra[];
  disponible: boolean;
  enVenta: boolean;
  eliminada: boolean;
  fechaEliminacion: string | null;
  autor: string;
  createdAt: string;
  updatedAt: string;
}
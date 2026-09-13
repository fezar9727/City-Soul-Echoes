// Pista leída de un archivo local del dispositivo del usuario — NUNCA
// se sube a nuestro backend, todo el procesamiento ocurre en el
// navegador. Estructuralmente distinta de Pista (Soul Station), que
// viene de Mongo/Jamendo — por eso es un modelo separado, no el mismo
// reutilizado con campos opcionales (evita mezclar 2 dominios en 1 tipo).
export interface PistaLocal {
  id: string;
  archivo: File;
  titulo: string;
  artista: string;
  album: string;
  anio: string;
  duracionSegundos: number;
  urlObjeto: string;   // URL.createObjectURL(archivo), revocada al descartar
  caratulaUrl: string | null; // extraída del tag ID3 embebido, si existe
}
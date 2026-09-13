import { Injectable } from '@angular/core';

// Estructura guardada en IndexedDB — el handle es una REFERENCIA al
// archivo real en disco (FileSystemFileHandle, API estándar MDN),
// nunca una copia de los bytes del audio: así la biblioteca "recuerda"
// qué reproducir sin duplicar espacio, tal como se pidió.
interface EntradaBiblioteca {
  id: string;
  handle: FileSystemFileHandle;
  titulo: string;
  artista: string;
  album: string;
  caratulaBlob: Blob | null;
}

// Persistencia real vía IndexedDB nativo (API estándar del navegador,
// sin librerías externas) — separado en su propio servicio de dominio
// (biblioteca del usuario), distinto de LectorMetadataService (lee
// metadata) y AudioLocalService (reproduce), coherente con el punto 2
// del Prompt Maestro.
@Injectable({ providedIn: 'root' })
export class BibliotecaLocalService {
  private readonly NOMBRE_DB = 'city-soul-echoes-biblioteca';
  private readonly VERSION_DB = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private abrirDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const solicitud = indexedDB.open(this.NOMBRE_DB, this.VERSION_DB);
      solicitud.onupgradeneeded = () => {
        const db = solicitud.result;
        if (!db.objectStoreNames.contains('pistas')) {
          db.createObjectStore('pistas', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('listas')) {
          db.createObjectStore('listas', { keyPath: 'id' });
        }
      };
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error);
    });
    return this.dbPromise;
  }

  async guardarPista(entrada: EntradaBiblioteca): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pistas', 'readwrite');
      tx.objectStore('pistas').put(entrada);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listarPistas(): Promise<EntradaBiblioteca[]> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pistas', 'readonly');
      const solicitud = tx.objectStore('pistas').getAll();
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error);
    });
  }

  async eliminarPista(id: string): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pistas', 'readwrite');
      tx.objectStore('pistas').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Listas propias del usuario — guardan solo el nombre y los IDs de
  // pista que contienen, referenciando la biblioteca ya guardada
  // (nunca duplican el handle ni el archivo).
  async guardarLista(lista: { id: string; nombre: string; pistaIds: string[] }): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listas', 'readwrite');
      tx.objectStore('listas').put(lista);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async eliminarLista(id: string): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listas', 'readwrite');
      tx.objectStore('listas').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listarListas(): Promise<{ id: string; nombre: string; pistaIds: string[] }[]> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listas', 'readonly');
      const solicitud = tx.objectStore('listas').getAll();
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error);
    });
  }

  // El navegador SIEMPRE exige volver a confirmar permiso sobre un
  // handle guardado entre sesiones (restricción de seguridad real,
  // no evitable) — debe llamarse desde un gesto real del usuario
  // (un click), nunca automático al cargar la página.
  async pedirPermiso(handle: FileSystemFileHandle): Promise<boolean> {
    const permiso = await (handle as any).queryPermission({ mode: 'read' });
    if (permiso === 'granted') return true;
    const nuevoPermiso = await (handle as any).requestPermission({ mode: 'read' });
    return nuevoPermiso === 'granted';
  }
}
import { Injectable } from '@angular/core';
// Import directo al bundle del navegador dentro del paquete — fix
// real y documentado: jsmediatags es un paquete CommonJS antiguo sin
// campo "exports" en su package.json, por lo que Vite no puede
// resolver el import estándar del paquete raíz.
import * as jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { PistaLocal } from '../models/pista-local.model';

// Servicio dedicado a leer metadata ID3 real de archivos locales —
// separado de SoulStationService a propósito (punto 2 del Prompt
// Maestro: cada dominio en su propio archivo, nunca mezclado).
@Injectable({ providedIn: 'root' })
export class LectorMetadataService {

  // jsmediatags.read() es callback-based (API real de la librería) —
  // se envuelve en una Promise real para poder usar async/await en
  // el componente, patrón estándar de interoperabilidad.
  async leerPista(archivo: File): Promise<PistaLocal> {
    const tags = await this.leerTagsId3(archivo);
    const urlObjeto = URL.createObjectURL(archivo);

    return {
      id: `${archivo.name}-${archivo.lastModified}`,
      archivo,
      titulo: tags?.title || this.nombreSinExtension(archivo.name),
      artista: tags?.artist || 'Artista desconocido',
      album: tags?.album || '',
      anio: tags?.year || '',
      duracionSegundos: 0, // se completa real al cargar el <audio>, ver componente
      urlObjeto,
      caratulaUrl: this.extraerCaratula(tags?.picture)
    };
  }

  private leerTagsId3(archivo: File): Promise<any> {
    return new Promise((resolve) => {
      jsmediatags.read(archivo, {
        onSuccess: (resultado: any) => resolve(resultado.tags),
        // Si el archivo no tiene tags (WAV sin ID3, etc.) no es un
        // error real del usuario — se resuelve con null y el
        // componente cae al nombre de archivo como título.
        onError: () => resolve(null)
      });
    });
  }

  private nombreSinExtension(nombre: string): string {
    return nombre.replace(/\.[^/.]+$/, '');
  }

  // La carátula embebida en el ID3 viene como bytes crudos — se arma
  // un Blob real y se genera una URL de objeto, misma técnica que el
  // audio (URL.createObjectURL, API estándar).
  private extraerCaratula(picture: any): string | null {
    if (!picture?.data) return null;
    const bytes = new Uint8Array(picture.data);
    const blob = new Blob([bytes], { type: picture.format });
    return URL.createObjectURL(blob);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Servicio dedicado a MusicBrainz — API pública, gratuita, sin key
// (https://musicbrainz.org/doc/MusicBrainz_API) — separado en su
// propio archivo de dominio, distinto de LectorMetadataService (lee
// tags ID3 locales) y AudioLocalService (reproduce), coherente con
// el punto 2 del Prompt Maestro. Nunca trae letras ni texto con
// copyright, solo metadata factual (año, álbum) — respeta la
// restricción legal ya acordada sobre contenido protegido.
@Injectable({ providedIn: 'root' })
export class HistoriaCancionService {
  private readonly BASE_URL = 'https://musicbrainz.org/ws/2';

  constructor(private http: HttpClient) {}

  async buscarInfo(titulo: string, artista: string): Promise<string | null> {
    try {
      const consulta = encodeURIComponent(`recording:"${titulo}" AND artist:"${artista}"`);
      const url = `${this.BASE_URL}/recording/?query=${consulta}&fmt=json&limit=1`;
      const respuesta: any = await firstValueFrom(this.http.get(url));
      const grabacion = respuesta?.recordings?.[0];
      if (!grabacion) return null;

      const partes: string[] = [];
      const lanzamiento = grabacion.releases?.[0];
      const artistaInfo = grabacion['artist-credit']?.[0]?.artist;
      if (lanzamiento?.date) partes.push(`Lanzada en ${lanzamiento.date.slice(0, 4)}`);
      if (lanzamiento?.['release-group']?.['primary-type']) {
        partes.push(`(${lanzamiento['release-group']['primary-type']})`);
      }
      if (artistaInfo?.country) partes.push(`· Artista de ${artistaInfo.country}`);
      if (artistaInfo?.disambiguation) partes.push(`— ${artistaInfo.disambiguation}`);
      return partes.length ? partes.join(' ') : null;
    } catch (error) {
      // Sin conexión, sin resultados, o rate limit de la API pública
      // — no es un error real del usuario, simplemente no hay datos.
      return null;
    }
  }
}
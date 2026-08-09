import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaEventos, RespuestaEvento, RespuestaPapeleraEventos, RespuestaModeracion, Evento } from '../models/evento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private readonly apiUrl = `${environment.apiUrl}/eventos`;

  constructor(private http: HttpClient) {}

  obtenerTodos(tipo?: string): Observable<RespuestaEventos> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<RespuestaEventos>(`${this.apiUrl}${query}`);
  }

  obtenerPorId(id: string): Observable<RespuestaEvento> {
    return this.http.get<RespuestaEvento>(`${this.apiUrl}/${id}`);
  }

  crear(datos: FormData): Observable<RespuestaEvento> {
    return this.http.post<RespuestaEvento>(this.apiUrl, datos);
  }

  actualizar(id: string, datos: FormData): Observable<RespuestaEvento> {
    return this.http.put<RespuestaEvento>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  obtenerPapelera(): Observable<RespuestaPapeleraEventos> {
    return this.http.get<RespuestaPapeleraEventos>(`${this.apiUrl}/papelera`);
  }

  restaurar(id: string): Observable<{ ok: boolean; mensaje: string; evento: Evento }> {
    return this.http.patch<{ ok: boolean; mensaje: string; evento: Evento }>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  eliminarDefinitivo(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}/definitivo`);
  }

  obtenerPendientesModeracion(): Observable<RespuestaEventos> {
    return this.http.get<RespuestaEventos>(`${this.apiUrl}/moderacion/pendientes`);
  }

  moderar(id: string, decision: 'aprobado' | 'rechazado', motivoRechazo?: string): Observable<RespuestaModeracion> {
    return this.http.patch<RespuestaModeracion>(`${this.apiUrl}/${id}/moderar`, { decision, motivoRechazo });
  }
}
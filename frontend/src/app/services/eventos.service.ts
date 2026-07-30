import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento, RespuestaEventos, RespuestaViernesCulturales, RespuestaEvento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private readonly apiUrl = 'http://localhost:4000/api/eventos';

  constructor(private http: HttpClient) {}

  obtenerTodos(tipo?: string): Observable<RespuestaEventos> {
    const url = tipo ? `${this.apiUrl}?tipo=${tipo}` : this.apiUrl;
    return this.http.get<RespuestaEventos>(url);
  }

  obtenerViernesCulturales(): Observable<RespuestaViernesCulturales> {
    return this.http.get<RespuestaViernesCulturales>(`${this.apiUrl}/viernes-culturales`);
  }

  obtenerPorId(id: string): Observable<RespuestaEvento> {
    return this.http.get<RespuestaEvento>(`${this.apiUrl}/${id}`);
  }

  crear(datos: Partial<Evento>): Observable<RespuestaEvento> {
    return this.http.post<RespuestaEvento>(this.apiUrl, datos);
  }

  actualizar(id: string, datos: Partial<Evento>): Observable<RespuestaEvento> {
    return this.http.put<RespuestaEvento>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}
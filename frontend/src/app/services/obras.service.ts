import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Obra } from '../models/obra.model';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ObrasService {
  private readonly apiUrl = `${environment.apiUrl}/obras`;

  constructor(private http: HttpClient) {}

  obtenerTodas(autor?: string): Observable<{ ok: boolean; total: number; obras: Obra[] }> {
    const query = autor ? `?autor=${autor}` : '';
    return this.http.get<{ ok: boolean; total: number; obras: Obra[] }>(`${this.apiUrl}${query}`);
  }

  obtenerMisObras(): Observable<{ ok: boolean; total: number; obras: Obra[] }> {
    return this.http.get<{ ok: boolean; total: number; obras: Obra[] }>(`${this.apiUrl}/mis-obras`);
  }

  obtenerPorId(id: string): Observable<{ ok: boolean; obra: Obra }> {
    return this.http.get<{ ok: boolean; obra: Obra }>(`${this.apiUrl}/${id}`);
  }

  crear(datos: FormData): Observable<{ ok: boolean; obra: Obra }> {
    return this.http.post<{ ok: boolean; obra: Obra }>(this.apiUrl, datos);
  }

  actualizar(id: string, datos: FormData): Observable<{ ok: boolean; obra: Obra }> {
    return this.http.put<{ ok: boolean; obra: Obra }>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  obtenerPapelera(): Observable<{ ok: boolean; total: number; obras: (Obra & { diasRestantes: number })[] }> {
    return this.http.get<{ ok: boolean; total: number; obras: (Obra & { diasRestantes: number })[] }>(`${this.apiUrl}/papelera`);
  }

  restaurar(id: string): Observable<{ ok: boolean; mensaje: string; obra: Obra }> {
    return this.http.patch<{ ok: boolean; mensaje: string; obra: Obra }>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  eliminarDefinitivo(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}/definitivo`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaCursos, RespuestaCurso, RespuestaPapeleraCursos, Curso } from '../models/curso.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private readonly apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

    obtenerTodos(docente?: string): Observable<RespuestaCursos> {
    const query = docente ? `?docente=${docente}` : '';
    return this.http.get<RespuestaCursos>(`${this.apiUrl}${query}`);
  }

  // Exclusivo para el panel de administración — devuelve todos los
  // cursos no eliminados (publicados o no), a diferencia de
  // obtenerTodos(), que solo trae los publicados (uso público).
  obtenerTodosAdmin(): Observable<RespuestaCursos> {
    return this.http.get<RespuestaCursos>(`${this.apiUrl}/admin`);
  }

  obtenerPorId(id: string): Observable<RespuestaCurso> {
    return this.http.get<RespuestaCurso>(`${this.apiUrl}/${id}`);
  }

  crear(datos: FormData): Observable<RespuestaCurso> {
    return this.http.post<RespuestaCurso>(this.apiUrl, datos);
  }

  actualizar(id: string, datos: FormData): Observable<RespuestaCurso> {
    return this.http.put<RespuestaCurso>(`${this.apiUrl}/${id}`, datos);
  }

  publicar(id: string): Observable<{ ok: boolean; mensaje: string; curso: Curso }> {
    return this.http.patch<{ ok: boolean; mensaje: string; curso: Curso }>(`${this.apiUrl}/${id}/publicar`, {});
  }

  eliminar(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  obtenerPapelera(): Observable<RespuestaPapeleraCursos> {
    return this.http.get<RespuestaPapeleraCursos>(`${this.apiUrl}/papelera`);
  }

  restaurar(id: string): Observable<{ ok: boolean; mensaje: string; curso: Curso }> {
    return this.http.patch<{ ok: boolean; mensaje: string; curso: Curso }>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  eliminarDefinitivo(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}/definitivo`);
  }
}
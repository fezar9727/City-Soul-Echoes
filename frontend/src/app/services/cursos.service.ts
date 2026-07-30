import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso, RespuestaCursos, RespuestaCurso } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private readonly apiUrl = 'http://localhost:4000/api/cursos';

  constructor(private http: HttpClient) {}

  obtenerTodos(categoria?: string): Observable<RespuestaCursos> {
    const url = categoria ? `${this.apiUrl}?categoria=${categoria}` : this.apiUrl;
    return this.http.get<RespuestaCursos>(url);
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

  eliminar(id: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  publicar(id: string): Observable<{ ok: boolean; mensaje: string; curso: Curso }> {
    return this.http.patch<{ ok: boolean; mensaje: string; curso: Curso }>(`${this.apiUrl}/${id}/publicar`, {});
  }
}
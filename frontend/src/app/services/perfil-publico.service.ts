import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaPerfilPublico } from '../models/perfil-publico.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerfilPublicoService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios/perfil`;
  constructor(private http: HttpClient) {}
  obtenerPorId(id: string): Observable<RespuestaPerfilPublico> {
    return this.http.get<RespuestaPerfilPublico>(`${this.apiUrl}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaBienestar, RespuestaBienestar } from '../models/bienestar.model';

@Injectable({
  providedIn: 'root'
})
export class BienestarService {
  private readonly apiUrl = 'http://localhost:4000/api/bienestar';

  constructor(private http: HttpClient) {}

  obtenerPorCategoria(categoria: CategoriaBienestar): Observable<RespuestaBienestar> {
    return this.http.get<RespuestaBienestar>(`${this.apiUrl}?categoria=${categoria}`);
  }
}
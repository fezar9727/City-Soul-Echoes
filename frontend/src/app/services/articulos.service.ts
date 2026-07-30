import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaArticulo, RespuestaNoticias } from '../models/articulo.model';

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  private readonly apiUrl = 'http://localhost:4000/api/noticias';

  constructor(private http: HttpClient) {}

  obtenerPorCategoria(categoria: CategoriaArticulo): Observable<RespuestaNoticias> {
    return this.http.get<RespuestaNoticias>(`${this.apiUrl}?categoria=${categoria}`);
  }
}
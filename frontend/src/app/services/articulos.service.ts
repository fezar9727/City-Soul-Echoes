import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaArticulo, RespuestaNoticias } from '../models/articulo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  private readonly apiUrl = `${environment.apiUrl}/noticias`;

  constructor(private http: HttpClient) {}

  obtenerPorCategoria(categoria: CategoriaArticulo): Observable<RespuestaNoticias> {
    return this.http.get<RespuestaNoticias>(`${this.apiUrl}?categoria=${categoria}`);
  }
}
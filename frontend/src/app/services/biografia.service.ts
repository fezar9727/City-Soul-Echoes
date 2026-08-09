import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaBiografia } from '../models/biografia.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BiografiaService {
  private readonly apiUrl = `${environment.apiUrl}/biografia`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<RespuestaBiografia> {
    return this.http.get<RespuestaBiografia>(this.apiUrl);
  }
}
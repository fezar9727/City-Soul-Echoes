import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaBiografia } from '../models/biografia.model';

@Injectable({
  providedIn: 'root'
})
export class BiografiaService {
  private readonly apiUrl = 'http://localhost:4000/api/biografia';

  constructor(private http: HttpClient) {}

  obtener(): Observable<RespuestaBiografia> {
    return this.http.get<RespuestaBiografia>(this.apiUrl);
  }
}
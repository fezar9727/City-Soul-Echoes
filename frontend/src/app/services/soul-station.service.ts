import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaSoulStation } from '../models/soul-station.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SoulStationService {
  private readonly apiUrl = `${environment.apiUrl}/soul-station`;

  constructor(private http: HttpClient) {}

  obtenerEstacion(): Observable<RespuestaSoulStation> {
    return this.http.get<RespuestaSoulStation>(this.apiUrl);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { RespuestaAuth, CredencialesLogin, DatosRegistroUsuario, Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly claveToken = 'cse_token';
  private readonly claveUsuario = 'cse_usuario';
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuarioGuardado());
  usuarioActual$ = this.usuarioActualSubject.asObservable();
  constructor(private http: HttpClient) {}
  registrarUsuario(datos: DatosRegistroUsuario): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/registro/usuario`, datos).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }
  login(credenciales: CredencialesLogin): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }
  logout(): void {
    localStorage.removeItem(this.claveToken);
    localStorage.removeItem(this.claveUsuario);
    this.usuarioActualSubject.next(null);
  }
  obtenerToken(): string | null {
    return localStorage.getItem(this.claveToken);
  }
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }
  private guardarSesion(respuesta: RespuestaAuth): void {
    localStorage.setItem(this.claveToken, respuesta.token);
    localStorage.setItem(this.claveUsuario, JSON.stringify(respuesta.usuario));
    this.usuarioActualSubject.next(respuesta.usuario);
  }
  private obtenerUsuarioGuardado(): Usuario | null {
    const datos = localStorage.getItem(this.claveUsuario);
    return datos ? JSON.parse(datos) : null;
  }
}
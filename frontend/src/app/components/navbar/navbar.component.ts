import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  usuarioActual: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private notificacion: NotificacionService
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.notificacion.info('Sesión cerrada', 'Volvé pronto a City Soul Echoes.');
  }
}
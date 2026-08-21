import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  usuarioActual: Usuario | null = null;
  private subNavegacion?: Subscription;

  constructor(
    private authService: AuthService,
    private notificacion: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
    // data-bs-dismiss="collapse" depende del sistema de eventos
    // delegados de Bootstrap sobre el document — en una SPA, el ciclo
    // de detección de cambios de Angular puede interponerse antes de
    // que ese handler termine de procesar el cierre, por eso el menú
    // a veces quedaba abierto tras navegar. Acá se controla el cierre
    // directamente desde Angular: al terminar cada navegación, si el
    // menú colapsado sigue con la clase "show" (abierto), se simula
    // un click real sobre el propio botón hamburguesa — reutiliza el
    // mecanismo nativo de Bootstrap (con su animación normal) en vez
    // de pelear contra el sistema de eventos que estaba fallando.
    this.subNavegacion = this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(() => {
        const menu = document.getElementById('navbarNav');
        if (menu?.classList.contains('show')) {
          const boton = document.querySelector<HTMLButtonElement>('.navbar-toggler');
          boton?.click();
        }
      });
  }

  ngOnDestroy(): void {
    this.subNavegacion?.unsubscribe();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.notificacion.info('Sesión cerrada', 'Volvé pronto a City Soul Echoes.');
  }
}
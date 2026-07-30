import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacion = inject(NotificacionService);

  const usuario = authService.obtenerUsuarioActual();

  if (usuario && usuario.rol === 'admin') {
    return true;
  }

  notificacion.error('Acceso restringido', 'Esta zona es solo para administradores.');
  router.navigate(['/']);
  return false;
};
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

const toastBase = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  background: '#111318',
  color: '#f1f1f1',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  exito(titulo: string, texto?: string): void {
    toastBase.fire({
      icon: 'success',
      title: titulo,
      text: texto,
      iconColor: '#39ff9d'
    });
  }

  error(titulo: string, texto?: string): void {
    toastBase.fire({
      icon: 'error',
      title: titulo,
      text: texto,
      iconColor: '#ff4d6d'
    });
  }

  info(titulo: string, texto?: string): void {
    toastBase.fire({
      icon: 'info',
      title: titulo,
      text: texto,
      iconColor: '#3ab8ff'
    });
  }
}
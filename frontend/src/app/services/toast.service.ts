import { Injectable } from '@angular/core';

// Servicio de toast liviano y propio — reutilizable por cualquier
// componente del proyecto (Soul Station, reproductor local, futuros
// módulos). Se inyecta directo en el DOM (sin librería externa como
// SweetAlert2), siguiendo el patrón real observado en YouTube/Spotify/
// sistemas operativos: no bloqueante, se autocierra, texto breve.
@Injectable({ providedIn: 'root' })
export class ToastService {
  private contenedor: HTMLDivElement | null = null;

  mostrar(mensaje: string, tipo: 'info' | 'advertencia' = 'info', duracionMs = 4000): void {
    if (!this.contenedor) {
      this.contenedor = document.createElement('div');
      this.contenedor.className = 'toast-contenedor-global';
      document.body.appendChild(this.contenedor);
    }
    const toast = document.createElement('div');
    toast.className = `toast-item toast-item--${tipo}`;
    toast.textContent = mensaje;
    this.contenedor.appendChild(toast);

    // requestAnimationFrame asegura que la transición CSS de entrada
    // se dispare (el navegador necesita 1 frame con la clase inicial
    // aplicada antes de agregar 'toast-item--visible').
    requestAnimationFrame(() => toast.classList.add('toast-item--visible'));

    setTimeout(() => {
      toast.classList.remove('toast-item--visible');
      setTimeout(() => toast.remove(), 300);
    }, duracionMs);
  }
}
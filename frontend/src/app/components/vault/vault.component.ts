import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObrasService } from '../../services/obras.service';
import { Obra } from '../../models/obra.model';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-vault',
  imports: [CommonModule, RevealDirective],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {
  obras: Obra[] = [];
  lightboxAbierto = false;
  indiceActual = 0;

  constructor(private obrasService: ObrasService) {}

  ngOnInit(): void {
    this.obrasService.obtenerTodas().subscribe({
      next: (respuesta) => {
        this.obras = respuesta.obras;
      },
      error: () => {
        // Si el backend no responde, la sección queda vacía en vez de romper el sitio.
      }
    });
  }

  get obraActual(): Obra | undefined {
    return this.obras[this.indiceActual];
  }

  abrirLightbox(indice: number): void {
    this.indiceActual = indice;
    this.lightboxAbierto = true;
  }

  cerrarLightbox(): void {
    this.lightboxAbierto = false;
  }

  irAnterior(): void {
    this.indiceActual = this.indiceActual === 0 ? this.obras.length - 1 : this.indiceActual - 1;
  }

  irSiguiente(): void {
    this.indiceActual = this.indiceActual === this.obras.length - 1 ? 0 : this.indiceActual + 1;
  }
}
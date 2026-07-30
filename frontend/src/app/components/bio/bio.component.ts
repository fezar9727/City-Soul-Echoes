import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiografiaService } from '../../services/biografia.service';
import { Parrafo } from '../../models/biografia.model';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-bio',
  imports: [CommonModule, RevealDirective],
  templateUrl: './bio.component.html',
  styleUrl: './bio.component.css'
})
export class BioComponent implements OnInit {
  @ViewChild('sonidoHologram') sonidoHologram!: ElementRef<HTMLAudioElement>;
  nombreCompleto = '';
  edad = 0;
  parrafos: Parrafo[] = [];
  cargando = true;

  abierto = false;
  mostrandoLoader = false;
  animarBarra = false;
  mostrandoTexto = false;

  // Duración extendida (era 1700ms en el JS original, ahora +3500ms)
  private readonly DURACION_LOADER_MS = 2800;

  constructor(private biografiaService: BiografiaService) {}

  ngOnInit(): void {
    this.biografiaService.obtener().subscribe({
      next: (respuesta) => {
        this.nombreCompleto = respuesta.biografia.nombreCompleto;
        this.edad = respuesta.biografia.edad;
        this.parrafos = [...respuesta.biografia.parrafos].sort((a, b) => a.orden - b.orden);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  toggleBio(): void {
    if (!this.abierto) {
      this.abierto = true;
      this.mostrandoTexto = false;
      this.mostrandoLoader = true;
      this.animarBarra = false;

      const audio = this.sonidoHologram.nativeElement;
      audio.currentTime = 0;
      audio.volume = 0.6;
      void audio.play().catch(() => {});

      // Pequeño delay antes de activar la animación de la barra: le da
      // tiempo al navegador de pintar el estado inicial (width: 0) antes
      // de aplicar la transición hacia el 100% — sin esto, a veces el
      // navegador salta directo al final sin mostrar el movimiento.
      setTimeout(() => {
        this.animarBarra = true;
      }, 30);

      setTimeout(() => {
        this.mostrandoLoader = false;
        this.mostrandoTexto = true;
        audio.pause();
        audio.currentTime = 0;
      }, this.DURACION_LOADER_MS);
    } else {
      this.abierto = false;
      this.mostrandoTexto = false;
      this.mostrandoLoader = false;
      this.animarBarra = false;
      this.sonidoHologram.nativeElement.pause();
    }
  }
}
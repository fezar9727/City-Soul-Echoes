import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoulStationService } from '../../services/soul-station.service';
import { Pista } from '../../models/soul-station.model';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-soul-station',
  imports: [CommonModule, RevealDirective],
  templateUrl: './soul-station.component.html',
  styleUrl: './soul-station.component.css'
})
export class SoulStationComponent implements OnInit {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  playlist: Pista[] = [];
  nombreEstacion = '';
  descripcionEstacion = '';
  cargando = true;
  error = false;

  indiceActual = 0;
  reproduciendo = false;

  constructor(private soulStationService: SoulStationService) {}

  ngOnInit(): void {
    this.soulStationService.obtenerEstacion().subscribe({
      next: (respuesta) => {
        this.nombreEstacion = respuesta.estacion.nombre;
        this.descripcionEstacion = respuesta.estacion.descripcion;
        this.playlist = [...respuesta.estacion.playlist].sort((a, b) => a.orden - b.orden);
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  get pistaActual(): Pista | null {
    return this.playlist[this.indiceActual] ?? null;
  }

  seleccionarPista(indice: number): void {
    this.indiceActual = indice;
    this.reproducir();
  }

  togglePlayPause(): void {
    if (this.reproduciendo) {
      this.audioPlayerRef.nativeElement.pause();
      this.reproduciendo = false;
    } else {
      this.reproducir();
    }
  }

  private reproducir(): void {
    const audio = this.audioPlayerRef.nativeElement;
    audio.src = this.pistaActual?.url ?? '';
    audio.play();
    this.reproduciendo = true;
  }

  pistaSiguiente(): void {
    if (this.indiceActual < this.playlist.length - 1) {
      this.indiceActual++;
    } else {
      this.indiceActual = 0;
    }
    this.reproducir();
  }

  pistaAnterior(): void {
    if (this.indiceActual > 0) {
      this.indiceActual--;
    } else {
      this.indiceActual = this.playlist.length - 1;
    }
    this.reproducir();
  }

  alTerminarPista(): void {
    this.pistaSiguiente();
  }

  formatearDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }
}
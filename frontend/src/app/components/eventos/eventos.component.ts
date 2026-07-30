import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService } from '../../services/eventos.service';
import { Evento } from '../../models/evento.model';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-eventos',
  imports: [CommonModule, RevealDirective],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];
  cargando = true;
  error = false;

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {
    this.eventosService.obtenerTodos('evento').subscribe({
      next: (respuesta) => {
        this.eventos = respuesta.eventos;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(fecha).toLocaleDateString('es-CO', opciones);
  }
}
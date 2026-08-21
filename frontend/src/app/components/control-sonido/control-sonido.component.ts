import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SonidoZonaService } from '../../services/sonido-zona.service';

@Component({
  selector: 'app-control-sonido',
  imports: [CommonModule],
  templateUrl: './control-sonido.component.html',
  styleUrl: './control-sonido.component.css'
})
export class ControlSonidoComponent implements OnInit, OnDestroy {
  volumen = 0.35;
  muteado = false;

  private subs = new Subscription();

  constructor(public sonidoService: SonidoZonaService) {}

  ngOnInit(): void {
    this.subs.add(this.sonidoService.volumen$.subscribe((v) => (this.volumen = v)));
    this.subs.add(this.sonidoService.mute$.subscribe((m) => (this.muteado = m)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onCambioVolumen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.sonidoService.establecerVolumen(Number(input.value));
  }

  onToggleMute(): void {
    this.sonidoService.alternarMute();
  }
}
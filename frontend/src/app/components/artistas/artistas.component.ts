import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../directives/reveal.directive';
import { ParticulasFondoDirective } from '../../directives/particulas-fondo.directive';

@Component({
  selector: 'app-artistas',
  imports: [CommonModule, RevealDirective, ParticulasFondoDirective],
  templateUrl: './artistas.component.html',
  styleUrl: './artistas.component.css'
})
export class ArtistasComponent {}
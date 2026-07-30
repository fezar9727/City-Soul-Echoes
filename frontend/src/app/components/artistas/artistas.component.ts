import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-artistas',
  imports: [RevealDirective],
  templateUrl: './artistas.component.html',
  styleUrl: './artistas.component.css'
})
export class ArtistasComponent {}
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { VaultComponent } from '../../components/vault/vault.component';
import { ArtistasComponent } from '../../components/artistas/artistas.component';
import { SoulStationComponent } from '../../components/soul-station/soul-station.component';
import { EventosComponent } from '../../components/eventos/eventos.component';
import { BienestarComponent } from '../../components/bienestar/bienestar.component';
import { AprendizajeComponent } from '../../components/aprendizaje/aprendizaje.component';
import { ArticulosComponent } from '../../components/articulos/articulos.component';
import { BioComponent } from '../../components/bio/bio.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    HeroComponent,
    VaultComponent,
    ArtistasComponent,
    SoulStationComponent,
    EventosComponent,
    BienestarComponent,
    AprendizajeComponent,
    ArticulosComponent,
    BioComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
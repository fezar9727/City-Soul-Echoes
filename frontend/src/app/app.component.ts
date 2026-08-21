import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { ViewportScroller, CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { MinimapaComponent } from './components/minimapa/minimapa.component';
import { ScrollCoheteComponent } from './components/scroll-cohete/scroll-cohete.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MinimapaComponent, ScrollCoheteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  // Minimapa y Scroll-cohete dependen de anclas (id="inicio", id="vault",
  // etc.) que solo existen en el DOM de la Home — en cualquier otra ruta
  // quedaban montados igual (viven fuera del <router-outlet>) pero sin
  // nada real que mostrar, por eso aparecían "flotando" en Editar Perfil,
  // Login, paneles admin, etc. Se controlan con la URL activa en vez de
  // moverlos dentro de cada página, para no duplicar su lógica en 10
  // componentes distintos (punto 3 del Prompt Maestro).
  mostrarNavegacionDeHome = true;

  constructor(
    viewportScroller: ViewportScroller,
    private router: Router
  ) {
    viewportScroller.setOffset([0, 90]);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => {
        // Comparar solo la parte de PATH, sin el fragmento — un click
        // en cualquier ancla del navbar (routerLink="/" fragment="vault")
        // navega a "/#vault", que nunca es un match exacto contra "/".
        // Por eso el minimapa desaparecía apenas se clickeaba cualquier
        // link con ancla, aunque seguíamos en la Home.
        const soloPath = evento.urlAfterRedirects.split('#')[0];
        this.mostrarNavegacionDeHome = soloPath === '/';
      });
  }
}
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(viewportScroller: ViewportScroller) {
    // Compensa la altura del navbar fijo (90px) al navegar por ancla.
    // API oficial de Angular para este caso exacto — no es un workaround.
    viewportScroller.setOffset([0, 90]);
  }
}
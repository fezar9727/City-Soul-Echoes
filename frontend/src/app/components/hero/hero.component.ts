import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit {
  @ViewChild('videoFondo') videoFondo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    const video = this.videoFondo.nativeElement;
    video.muted = true;
    void video.play().catch(() => {
      // Autoplay bloqueado por el navegador: el video se queda en su primer
      // frame (fondo estático), sin afectar el resto del sitio.
    });
  }
}
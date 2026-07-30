import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appReveal]'
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const elemento = this.elementRef.nativeElement;

    if (!('IntersectionObserver' in window)) {
      elemento.classList.add('visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            elemento.classList.add('visible');
            this.observer?.unobserve(elemento);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0 }
    );

    this.observer.observe(elemento);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
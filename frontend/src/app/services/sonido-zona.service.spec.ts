import { TestBed } from '@angular/core/testing';

import { SonidoZonaService } from './sonido-zona.service';

describe('SonidoZonaService', () => {
  let service: SonidoZonaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonidoZonaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

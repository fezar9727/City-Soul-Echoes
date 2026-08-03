import { TestBed } from '@angular/core/testing';

import { PerfilPublicoService } from './perfil-publico.service';

describe('PerfilPublicoService', () => {
  let service: PerfilPublicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilPublicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

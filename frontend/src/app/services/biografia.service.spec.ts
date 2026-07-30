import { TestBed } from '@angular/core/testing';

import { BiografiaService } from './biografia.service';

describe('BiografiaService', () => {
  let service: BiografiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiografiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ObrasService } from './obras.service';

describe('ObrasService', () => {
  let service: ObrasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObrasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

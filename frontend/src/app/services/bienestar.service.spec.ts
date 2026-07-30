import { TestBed } from '@angular/core/testing';

import { BienestarService } from './bienestar.service';

describe('BienestarService', () => {
  let service: BienestarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BienestarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

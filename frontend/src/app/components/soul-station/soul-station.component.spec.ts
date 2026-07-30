import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoulStationComponent } from './soul-station.component';

describe('SoulStationComponent', () => {
  let component: SoulStationComponent;
  let fixture: ComponentFixture<SoulStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoulStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoulStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

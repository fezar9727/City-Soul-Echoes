import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfectoFondoSutilComponent } from './efecto-fondo-sutil.component';

describe('EfectoFondoSutilComponent', () => {
  let component: EfectoFondoSutilComponent;
  let fixture: ComponentFixture<EfectoFondoSutilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfectoFondoSutilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfectoFondoSutilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

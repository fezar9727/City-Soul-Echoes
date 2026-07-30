import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprendizajeComponent } from './aprendizaje.component';

describe('AprendizajeComponent', () => {
  let component: AprendizajeComponent;
  let fixture: ComponentFixture<AprendizajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprendizajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprendizajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlSonidoComponent } from './control-sonido.component';

describe('ControlSonidoComponent', () => {
  let component: ControlSonidoComponent;
  let fixture: ComponentFixture<ControlSonidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlSonidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlSonidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

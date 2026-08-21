import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPerfilComponent } from './editar-perfil.component';

describe('EditarPerfilComponent', () => {
  let component: EditarPerfilComponent;
  let fixture: ComponentFixture<EditarPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

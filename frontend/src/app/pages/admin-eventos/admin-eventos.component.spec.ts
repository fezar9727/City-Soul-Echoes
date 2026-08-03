import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventosComponent } from './admin-eventos.component';

describe('AdminEventosComponent', () => {
  let component: AdminEventosComponent;
  let fixture: ComponentFixture<AdminEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

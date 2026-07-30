import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminObrasComponent } from './admin-obras.component';

describe('AdminObrasComponent', () => {
  let component: AdminObrasComponent;
  let fixture: ComponentFixture<AdminObrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminObrasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminObrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

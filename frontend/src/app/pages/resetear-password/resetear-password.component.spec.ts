import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetearPasswordComponent } from './resetear-password.component';

describe('ResetearPasswordComponent', () => {
  let component: ResetearPasswordComponent;
  let fixture: ComponentFixture<ResetearPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetearPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetearPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReproductorLocalComponent } from './reproductor-local.component';

describe('ReproductorLocalComponent', () => {
  let component: ReproductorLocalComponent;
  let fixture: ComponentFixture<ReproductorLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReproductorLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReproductorLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollCoheteComponent } from './scroll-cohete.component';

describe('ScrollCoheteComponent', () => {
  let component: ScrollCoheteComponent;
  let fixture: ComponentFixture<ScrollCoheteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollCoheteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollCoheteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

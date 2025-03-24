import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaRutinaComponent } from './dia-rutina.component';

describe('DiaRutinaComponent', () => {
  let component: DiaRutinaComponent;
  let fixture: ComponentFixture<DiaRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiaRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

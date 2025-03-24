import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjercicioRutinaComponent } from './ejercicio-rutina.component';

describe('EjercicioRutinaComponent', () => {
  let component: EjercicioRutinaComponent;
  let fixture: ComponentFixture<EjercicioRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjercicioRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EjercicioRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

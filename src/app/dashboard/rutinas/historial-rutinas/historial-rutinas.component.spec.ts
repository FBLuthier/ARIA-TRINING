import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialRutinasComponent } from './historial-rutinas.component';

describe('HistorialRutinasComponent', () => {
  let component: HistorialRutinasComponent;
  let fixture: ComponentFixture<HistorialRutinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialRutinasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialRutinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRutinasComponent } from './crear-rutinas.component';

describe('CrearRutinasComponent', () => {
  let component: CrearRutinasComponent;
  let fixture: ComponentFixture<CrearRutinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRutinasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRutinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

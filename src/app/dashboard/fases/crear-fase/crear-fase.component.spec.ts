import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFaseComponent } from './crear-fase.component';

describe('CrearFaseComponent', () => {
  let component: CrearFaseComponent;
  let fixture: ComponentFixture<CrearFaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerRutinaComponent } from './ver-rutina.component';

describe('VerRutinaComponent', () => {
  let component: VerRutinaComponent;
  let fixture: ComponentFixture<VerRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

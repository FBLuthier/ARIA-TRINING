import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseRutinaComponent } from './fase-rutina.component';

describe('FaseRutinaComponent', () => {
  let component: FaseRutinaComponent;
  let fixture: ComponentFixture<FaseRutinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseRutinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseRutinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

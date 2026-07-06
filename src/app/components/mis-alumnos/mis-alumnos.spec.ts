import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAlumnos } from './mis-alumnos';

describe('MisAlumnos', () => {
  let component: MisAlumnos;
  let fixture: ComponentFixture<MisAlumnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisAlumnos],
    }).compileComponents();

    fixture = TestBed.createComponent(MisAlumnos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

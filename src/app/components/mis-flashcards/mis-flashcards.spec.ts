import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisFlashcards } from './mis-flashcards';

describe('MisFlashcards', () => {
  let component: MisFlashcards;
  let fixture: ComponentFixture<MisFlashcards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisFlashcards],
    }).compileComponents();

    fixture = TestBed.createComponent(MisFlashcards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

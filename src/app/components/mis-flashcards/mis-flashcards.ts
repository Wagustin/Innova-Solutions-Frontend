import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

interface Option {
  id?: number;
  textoOpcion: string;
  esCorrecta: boolean;
  feedbackRespuesta: string;
}

interface Flashcard {
  id: number;
  preguntaTexto: string;
  opciones: Option[];
  colorFondo?: string;
  colorTexto?: string;
  leccion?: { titulo: string };
  imagenUrl?: string;
  
  // UI State
  selectedOption?: Option;
  isAnswered?: boolean;
}

@Component({
  selector: 'app-mis-flashcards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-flashcards.html',
  styleUrls: ['./mis-flashcards.css']
})
export class MisFlashcards implements OnInit {
  flashcards: Flashcard[] = [];
  loading = true;
  errorMsg = '';

  constructor(private apiService: ApiDataService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getFlashcards().subscribe({
      next: (data: any[]) => {
        this.flashcards = data.map(card => ({
          ...card,
          selectedOption: undefined,
          isAnswered: false
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMsg = 'No se pudieron cargar las flashcards.';
        this.cdr.detectChanges();
      }
    });
  }

  selectOption(card: Flashcard, option: Option) {
    if (card.isAnswered) return;
    card.selectedOption = option;
  }

  evaluate(card: Flashcard) {
    if (!card.selectedOption) return;
    card.isAnswered = true;
  }
}

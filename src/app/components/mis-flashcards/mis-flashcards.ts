import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private apiService: ApiDataService) {}

  ngOnInit(): void {
    this.apiService.getFlashcards().subscribe({
      next: (data: any[]) => {
        this.flashcards = data.map(card => ({
          ...card,
          selectedOption: undefined,
          isAnswered: false
        }));
      },
      error: (err) => {
        console.error('Error fetching flashcards:', err);
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

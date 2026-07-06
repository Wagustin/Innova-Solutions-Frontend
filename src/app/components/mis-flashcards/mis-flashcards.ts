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
  filtro = '';
  seleccionadas = new Set<number>();
  rol = '';

  private normalizar(texto: string): string {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  get flashcardsFiltradas(): any[] {
    let resultado = this.flashcards;
    const term = this.normalizar(this.filtro);
    if (term) {
      resultado = resultado.filter(card =>
        this.normalizar(card.preguntaTexto ?? '').includes(term) ||
        this.normalizar(card.leccion?.titulo ?? '').includes(term)
      );
    }
    resultado.sort((a, b) => {
      const cmp = (a.preguntaTexto ?? '').localeCompare(b.preguntaTexto ?? '');
      return this.ordenAscendente ? cmp : -cmp;
    });
    return resultado;
  }

  constructor(private apiService: ApiDataService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    const userId = Number(localStorage.getItem('userId'));

    if (this.rol === 'ALUMNO') {
      this.apiService.getLecciones().subscribe({
        next: (lecciones) => {
          const leccionesIds = lecciones
            .filter((l: any) => l.estudiante && l.estudiante.id === userId)
            .map((l: any) => l.id);
          this.apiService.getFlashcards().subscribe({
            next: (data) => {
              this.flashcards = (data ?? []).filter(
                (f: any) => f.leccion && leccionesIds.includes(f.leccion.id)
              );
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
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.errorMsg = 'No se pudieron cargar las lecciones.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.apiService.getFlashcards().subscribe({
        next: (data) => {
          this.flashcards = data ?? [];
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
  }

  toggleSeleccion(id: number): void {
    if (this.seleccionadas.has(id)) this.seleccionadas.delete(id);
    else this.seleccionadas.add(id);
  }

  ordenAscendente = true;

  toggleOrden(): void {
    this.ordenAscendente = !this.ordenAscendente;
  }

  editarSeleccionadas(): void {
    if (this.seleccionadas.size === 0) return;
    const ids = [...this.seleccionadas];
    this.router.navigate(['/responder', ids[0]]);
  }

  eliminarSeleccionadas(): void {
    if (this.seleccionadas.size === 0) return;
    const ids = [...this.seleccionadas];
    const msg = ids.length === 1
      ? '¿Eliminar esta flashcard?'
      : `¿Eliminar ${ids.length} flashcards?`;
    if (!confirm(msg)) return;
    let completadas = 0;
    ids.forEach(id => {
      this.apiService.eliminarFlashcard(id).subscribe({
        next: () => {
          completadas++;
          if (completadas === ids.length) {
            this.flashcards = this.flashcards.filter(c => !this.seleccionadas.has(c.id));
            this.seleccionadas.clear();
            this.cdr.detectChanges();
          }
        },
        error: () => alert(`Error al eliminar flashcard ${id}`)
      });
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

  irAResponder(id: number): void {
    this.router.navigate(['/responder', id]);
  }
}

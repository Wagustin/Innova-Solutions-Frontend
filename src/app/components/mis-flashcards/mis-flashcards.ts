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

  get esProfesor(): boolean {
    const r = this.rol;
    const id = localStorage.getItem('rolId');
    return r === 'PROFESOR' || r === 'MAESTRO' || id === '1';
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
      const fallbackToDefault = () => {
        this.apiService.getFlashcards().subscribe({
          next: (data) => {
            const allFlashcards = data ?? [];
            this.flashcards = allFlashcards.filter((f: any) => f.id <= 3).map((f: any) => {
              // Ensure image URL is absolute or has a leading slash
              if (f.imagenUrl && !f.imagenUrl.startsWith('http') && !f.imagenUrl.startsWith('/')) {
                f.imagenUrl = '/' + f.imagenUrl;
              }
              
              if (f.imagenUrl && f.imagenUrl.includes('placehold.co')) {
                if (f.imagenUrl.includes('Manzanas')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80';
                } else if (f.imagenUrl.includes('Alegr')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';
                } else if (f.imagenUrl.includes('Avion')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80';
                }
              }

              // Add extra options if the flashcard only has 1 or 0 options
              if (!f.opciones || f.opciones.length <= 1) {
                if (f.id === 1) {
                  f.opciones = [
                    { textoOpcion: '1', esCorrecta: true, feedbackRespuesta: '¡Correcto!' },
                    { textoOpcion: '2', esCorrecta: false, feedbackRespuesta: 'Faltan algunas' },
                    { textoOpcion: '3', esCorrecta: false, feedbackRespuesta: 'Son demasiadas' }
                  ];
                } else if (f.id === 2) {
                  f.opciones = [
                    { textoOpcion: '😢', esCorrecta: false, feedbackRespuesta: 'Esa es tristeza' },
                    { textoOpcion: '😡', esCorrecta: false, feedbackRespuesta: 'Ese es enojo' },
                    { textoOpcion: '😊', esCorrecta: true, feedbackRespuesta: '¡Correcto! Es alegría' }
                  ];
                } else if (f.id === 3) {
                  f.opciones = [
                    { textoOpcion: 'E', esCorrecta: false, feedbackRespuesta: 'E de Elefante' },
                    { textoOpcion: 'I', esCorrecta: false, feedbackRespuesta: 'I de Iglesia' },
                    { textoOpcion: 'A', esCorrecta: true, feedbackRespuesta: '¡Excelente!' }
                  ];
                }
              }
              return f;
            });
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.loading = false;
            this.errorMsg = 'No se pudieron cargar las flashcards por defecto.';
            this.cdr.detectChanges();
          }
        });
      };

      if (!userId || isNaN(userId)) {
        fallbackToDefault();
        return;
      }

      this.apiService.getUsuario(userId).subscribe({
        next: (myUser) => {
          if (myUser && myUser.creadoPorId) {
            this.apiService.getUsuario(myUser.creadoPorId).subscribe({
              next: (myParent) => {
                const myProfessorId = myParent?.creadoPorId;

                this.apiService.getFlashcards().subscribe({
                  next: (data) => {
                    const allFlashcards = data ?? [];
                    if (myProfessorId) {
                      this.flashcards = allFlashcards.filter(
                        (f: any) => f.leccion && f.leccion.creador && f.leccion.creador.id == myProfessorId
                      );
                    }
                    
                    if (!myProfessorId || this.flashcards.length === 0) {
                      fallbackToDefault();
                      return;
                    }
                    
                    this.loading = false;
                    this.cdr.detectChanges();
                  },
                  error: (err) => {
                    console.error(err);
                    fallbackToDefault();
                  }
                });
              },
              error: (err) => {
                console.error('Error getting parent:', err);
                fallbackToDefault();
              }
            });
          } else {
             fallbackToDefault();
          }
        },
        error: (err) => {
          console.error('Error getting student user:', err);
          fallbackToDefault();
        }
      });
    } else {
      this.apiService.getFlashcards().subscribe({
        next: (data) => {
          const allFlashcards = data ?? [];
          this.flashcards = allFlashcards.map((f: any) => {
            // Ensure image URL is absolute or has a leading slash
            if (f.imagenUrl && !f.imagenUrl.startsWith('http') && !f.imagenUrl.startsWith('/')) {
              f.imagenUrl = '/' + f.imagenUrl;
            }
              
            if (f.id <= 3) {
              if (f.imagenUrl && f.imagenUrl.includes('placehold.co')) {
                if (f.imagenUrl.includes('Manzanas')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80';
                } else if (f.imagenUrl.includes('Alegr')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';
                } else if (f.imagenUrl.includes('Avion')) {
                  f.imagenUrl = 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80';
                }
              }

              // Add extra options if the flashcard only has 1 or 0 options
              if (!f.opciones || f.opciones.length <= 1) {
                if (f.id === 1) {
                  f.opciones = [
                    { textoOpcion: '1', esCorrecta: true, feedbackRespuesta: '¡Correcto!' },
                    { textoOpcion: '2', esCorrecta: false, feedbackRespuesta: 'Faltan algunas' },
                    { textoOpcion: '3', esCorrecta: false, feedbackRespuesta: 'Son demasiadas' }
                  ];
                } else if (f.id === 2) {
                  f.opciones = [
                    { textoOpcion: '😢', esCorrecta: false, feedbackRespuesta: 'Esa es tristeza' },
                    { textoOpcion: '😡', esCorrecta: false, feedbackRespuesta: 'Ese es enojo' },
                    { textoOpcion: '😊', esCorrecta: true, feedbackRespuesta: '¡Correcto! Es alegría' }
                  ];
                } else if (f.id === 3) {
                  f.opciones = [
                    { textoOpcion: 'E', esCorrecta: false, feedbackRespuesta: 'E de Elefante' },
                    { textoOpcion: 'I', esCorrecta: false, feedbackRespuesta: 'I de Iglesia' },
                    { textoOpcion: 'A', esCorrecta: true, feedbackRespuesta: '¡Excelente!' }
                  ];
                }
              }
            }
            return f;
          });
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

  irAResponder(id: number): void {
    this.router.navigate(['/responder', id]);
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

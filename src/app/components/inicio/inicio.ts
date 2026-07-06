import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  rol: string = '';
  usuarios: any[] = [];
  flashcards: any[] = [];
  temas: any[] = [];
  lecciones: any[] = [];
  
  totalAlumnos: number = 0;
  totalFlashcards: number = 0;
  totalLecciones: number = 0;
  totalTemas: number = 0;

  get esMaestro(): boolean {
    const r = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    const id = localStorage.getItem('rolId');
    return r === 'PROFESOR' || r === 'MAESTRO' || id === '1';
  }

  constructor(private api: ApiDataService) {}

  ngOnInit() {
    this.rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    const rolId = localStorage.getItem('rolId');
    
    if (this.rol === 'PROFESOR' || this.rol === 'MAESTRO' || rolId === '1') {
      this.cargarDatosDashboard();
    }
  }

  cargarDatosDashboard() {
    const teacherId = Number(localStorage.getItem('userId'));

    this.api.getMaestroStats().subscribe({
      next: (stats) => {
        this.totalAlumnos = stats.totalAlumnos;
        this.totalTemas = stats.totalTemas;
        this.totalLecciones = stats.totalLecciones;
        this.totalFlashcards = stats.totalFlashcards;
      },
      error: (err) => console.error('Error cargando stats de maestro', err)
    });

    this.api.getFlashcards().subscribe({
      next: (res) => {
        const all = res ?? [];
        // Filtrar últimas flashcards creadas por este profesor
        const teacherFlashcards = all.filter((f: any) => f.leccion && f.leccion.creador && f.leccion.creador.id === teacherId);
        this.flashcards = teacherFlashcards.slice(-5).reverse();
      },
      error: (err) => console.error('Error cargando flashcards', err)
    });
  }

  getDificultadClass(dificultad: string): string {
    switch(dificultad?.toUpperCase()) {
      case 'FACIL': return 'badge-success';
      case 'MEDIO': return 'badge-warning';
      case 'DIFICIL': return 'badge-danger';
      default: return 'badge-info';
    }
  }
}

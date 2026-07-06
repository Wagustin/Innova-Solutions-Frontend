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
  
  isLoading: boolean = true;

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
    } else {
      this.isLoading = false;
    }
  }

  cargarDatosDashboard() {
    this.api.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res.filter(u => {
          const r = (u.rol?.nombre || '').toUpperCase().replace(/^ROLE_/, '');
          return r === 'ALUMNO';
        });
        this.totalAlumnos = this.usuarios.length;
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });

    this.api.getFlashcards().subscribe({
      next: (res) => {
        this.totalFlashcards = res.length;
        this.flashcards = res.slice(-5).reverse();
      },
      error: (err) => console.error('Error cargando flashcards', err)
    });
    
    this.api.getTemas().subscribe({
      next: (res) => {
        this.temas = res;
        this.totalTemas = res.length;
      },
      error: (err) => console.error('Error cargando temas', err)
    });

    this.api.getLecciones().subscribe({
      next: (res) => {
        this.lecciones = res;
        this.totalLecciones = res.length;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error cargando lecciones', err);
        this.checkLoading();
      }
    });
  }
  
  checkLoading() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500); // Pequeño delay para mostrar la animación de carga
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

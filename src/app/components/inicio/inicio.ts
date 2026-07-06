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

  constructor(private api: ApiDataService) {}

  ngOnInit() {
    this.rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    
    if (this.rol === 'PROFESOR') {
      this.api.getUsuarios().subscribe({
        next: (res) => {
          this.usuarios = res.filter(u => {
            const r = (u.rol?.nombre || '').toUpperCase().replace(/^ROLE_/, '');
            return r === 'ALUMNO';
          });
        },
        error: (err) => console.error('Error cargando usuarios', err)
      });

      this.api.getFlashcards().subscribe({
        next: (res) => {
          // Mostrar las últimas 5 creadas
          this.flashcards = res.slice(-5).reverse();
        },
        error: (err) => console.error('Error cargando flashcards', err)
      });
    }
  }
}

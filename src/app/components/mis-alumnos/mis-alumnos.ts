import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

const ANIMALES = ['🐶','🐱','🐼','🦊','🐸','🦁','🐯','🐰','🐵','🐮','🐷','🦄','🐙','🦋','🐢','🦉','🐺','🦝','🐴','🐔','🐧','🐨','🦖','🐲'];

@Component({
  selector: 'app-mis-alumnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-alumnos.html',
  styleUrls: ['./mis-alumnos.css']
})
export class MisAlumnosComponent implements OnInit {
  alumnos: any[] = [];
  progresos: any[] = [];
  lecciones: any[] = [];
  flashcards: any[] = [];
  todosUsuarios: any[] = [];
  alumnoSeleccionadoId: number | null = null;
  userId: number | null = null;
  esPadre: boolean = false;
  titulo: string = 'Mis Alumnos';
  descripcion: string = 'Aquí puedes ver y supervisar el avance de cada uno de tus estudiantes.';

  constructor(private api: ApiDataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userId = Number(localStorage.getItem('userId'));
    const miRol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    
    if (miRol === 'PADRE') {
      this.esPadre = true;
      this.titulo = 'Mis Hijos';
      this.descripcion = 'Aquí puedes ver y acompañar el avance escolar de tus hijos de manera detallada.';
    }

    this.api.getUsuarios().subscribe({
      next: (res) => {
        this.todosUsuarios = res;
        console.log('Logged in userId:', this.userId);
        
        const miRol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');

        if (miRol === 'PROFESOR') {
          // 1. Encontrar a los PADRES que fueron creados por ESTE PROFESOR
          const misPadresIds = res
              .filter(u => u.creadoPorId == this.userId && 
                (u.rol?.id === 2 || (u.rol?.nombre || u.rol?.name || '').toUpperCase().includes('PADRE'))
              )
              .map(u => u.id);
          
          // 2. Filtrar a los ALUMNOS que fueron creados por esos PADRES o creados directamente por el profesor
          this.alumnos = res.filter(u => {
            const isAlumno = u.rol?.id === 3 || (u.rol?.nombre || u.rol?.name || '').toUpperCase().includes('ALUMNO');
            return isAlumno && (u.creadoPorId == this.userId || (u.creadoPorId != null && misPadresIds.includes(u.creadoPorId)));
          });
        } else if (miRol === 'PADRE') {
          // Filtrar a los ALUMNOS que fueron creados directamente por ESTE PADRE
          this.alumnos = res.filter(u => {
            const isAlumno = u.rol?.id === 3 || (u.rol?.nombre || u.rol?.name || '').toUpperCase().includes('ALUMNO');
            return isAlumno && u.creadoPorId == this.userId;
          });
        }
        
        this.cargarMasDatos();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando alumnos', err)
    });
  }

  cargarMasDatos(): void {
    this.api.getProgresosEvaluacion().subscribe({
      next: (data) => { this.progresos = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error progresos:', err)
    });

    this.api.getLecciones().subscribe({
      next: (data) => this.lecciones = data,
      error: (err) => console.error('Error lecciones:', err)
    });

    this.api.getFlashcards().subscribe({
      next: (data) => this.flashcards = data ?? [],
      error: (err) => console.error('Error flashcards:', err)
    });
  }

  seleccionarAlumno(id: number) {
    this.alumnoSeleccionadoId = this.alumnoSeleccionadoId === id ? null : id;
  }

  getLeccionesDeHijo(hijoId: number): any[] {
    const alumno = this.todosUsuarios.find(u => u.id === hijoId);
    if (!alumno) return [{ id: 1, titulo: 'Lecciones por defecto' }];

    const creadorAlumnoId = alumno.creadoPorId;
    if (!creadorAlumnoId) return [{ id: 1, titulo: 'Lecciones por defecto' }];

    const creadorAlumno = this.todosUsuarios.find(u => u.id === creadorAlumnoId);
    if (!creadorAlumno) return [{ id: 1, titulo: 'Lecciones por defecto' }];

    let profesorId: number | null = null;
    const creadorRol = (creadorAlumno.rol?.nombre || creadorAlumno.rol?.name || '').toUpperCase().replace(/^ROLE_/, '');

    if (creadorRol === 'PROFESOR' || creadorRol === 'MAESTRO') {
      profesorId = creadorAlumno.id;
    } else if (creadorRol === 'PADRE') {
      profesorId = creadorAlumno.creadoPorId;
    }

    if (!profesorId) {
      return [{ id: 1, titulo: 'Lecciones por defecto' }];
    }

    let misLecs = this.lecciones.filter((l: any) => l.creador && l.creador.id === profesorId);
    if (misLecs.length === 0) {
      return [{ id: 1, titulo: 'Lecciones por defecto' }];
    }
    return misLecs.filter((l: any) => !l.estudiante || l.estudiante.id === hijoId);
  }

  getFlashcardsDeLeccion(leccionId: number): any[] {
    const fcs = this.flashcards.filter((f: any) => f.leccion && f.leccion.id === leccionId);
    if (fcs.length === 0 && (leccionId === 1 || leccionId === 2 || leccionId === 3)) {
      return this.flashcards.filter(f => f.id === 1 || f.id === 2 || f.id === 3);
    }
    return fcs;
  }

  getAvatar(user: any): string {
    const id = user.id;
    if (id != null && !isNaN(Number(id))) {
      return ANIMALES[(Number(id) * 7 + 13) % ANIMALES.length];
    }
    return '🐶';
  }

  leccionCompletada(leccionId: number, hijoId: number): boolean {
    return this.progresos.some(
      (p: any) => p.leccion && p.leccion.id === leccionId && p.estudiante && p.estudiante.id === hijoId
    );
  }
}

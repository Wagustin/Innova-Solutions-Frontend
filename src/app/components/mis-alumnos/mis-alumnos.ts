import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-mis-alumnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-alumnos.html',
  styleUrls: ['./mis-alumnos.css']
})
export class MisAlumnosComponent implements OnInit {
  alumnos: any[] = [];

  constructor(private api: ApiDataService) {}

  ngOnInit() {
    this.api.getUsuarios().subscribe({
      next: (res) => {
        this.alumnos = res.filter(u => {
          const r = (u.rol?.nombre || '').toUpperCase().replace(/^ROLE_/, '');
          return r === 'ALUMNO';
        });
      },
      error: (err) => {
        console.error('Error cargando alumnos', err);
      }
    });
  }

  verAvance(alumnoId: number) {
    // Aquí puedes implementar la lógica para ver el progreso detallado de un alumno
    console.log('Ver avance del alumno:', alumnoId);
    alert('Esta funcionalidad abrirá el progreso detallado del alumno. (En desarrollo)');
  }
}

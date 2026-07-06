import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-registro-alumno',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './registro-alumno.html',
  styleUrls: ['./registro-alumno.css']
})
export class RegistroAlumno implements OnInit {
  // Navigation / Vista state: 'menu' | 'registro' | 'lista'
  vista: 'menu' | 'registro' | 'lista' = 'menu';
  
  // Registration form state
  alumnoForm!: FormGroup;
  submitAttempted = false;
  registrationSuccess = false;
  serverErrorMessage = '';

  // Children lists and relations
  hijos: any[] = [];
  progresos: any[] = [];
  relaciones: any[] = [];
  lecciones: any[] = [];
  flashcards: any[] = [];
  loaded = false;

  // Selected child and inline editing state
  hijoSeleccionadoId: number | null = null;
  hijoEditandoId: number | null = null;
  editNombreCompleto = '';
  editUsername = '';
  editPassword = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiDataService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  inicializarFormulario(): void {
    this.alumnoForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
    this.submitAttempted = false;
    this.registrationSuccess = false;
    this.serverErrorMessage = '';
  }

  vista: 'menu' | 'registro' | 'lista' = 'menu';

  // Navigation methods
  irARegistro(): void {
    this.inicializarFormulario();
    this.vista = 'registro';
  }

  irALista(): void {
    this.vista = 'lista';
    this.cargarDatos();
  }

  volverMenu(): void {
    this.vista = 'menu';
    this.hijoSeleccionadoId = null;
    this.hijoEditandoId = null;
  }

  // Data loading methods
  cargarDatos(): void {
    const parentIdStr = localStorage.getItem('userId');
    const parentId = parentIdStr ? Number(parentIdStr) : null;

    if (parentId) {
      this.apiService.getUsuarios().subscribe({
        next: (users) => {
          this.hijos = users.filter((u: any) => u.creadoPorId === parentId);
          this.cargarMasDatos();
        },
        error: (err) => {
          console.error('Error al cargar hijos:', err);
          this.loaded = true;
        }
      });
    } else {
      const username = localStorage.getItem('username');
      if (username) {
        this.apiService.getUsuarios().subscribe({
          next: (users) => {
            const me = users.find((u: any) => u.username === username);
            if (me) {
              localStorage.setItem('userId', me.id.toString());
              this.hijos = users.filter((u: any) => u.creadoPorId === me.id);
              this.cargarMasDatos();
            } else {
              this.loaded = true;
            }
          },
          error: (err) => {
            console.error('Error al cargar hijos por username', err);
            this.loaded = true;
          }
        });
      } else {
        this.loaded = true;
      }
    }
  }

  cargarMasDatos(): void {
    this.apiService.getProgresosEvaluacion().subscribe({
      next: (data) => {
        this.progresos = data;
        this.chequearCargaCompleta();
      },
      error: (err) => {
        console.error('Error al cargar progresos:', err);
        this.chequearCargaCompleta();
      }
    });

    this.apiService.getRelacionesTutorEstudiante().subscribe({
      next: (data) => {
        this.relaciones = data;
        this.chequearCargaCompleta();
      },
      error: (err) => {
        console.error('Error al cargar relaciones:', err);
        this.chequearCargaCompleta();
      }
    });

    this.apiService.getLecciones().subscribe({
      next: (data) => {
        this.lecciones = data;
        this.chequearCargaCompleta();
      },
      error: (err) => {
        console.error('Error al cargar lecciones:', err);
        this.chequearCargaCompleta();
      }
    });

    this.apiService.getFlashcards().subscribe({
      next: (data) => {
        this.flashcards = data ?? [];
      },
      error: (err) => console.error('Error al cargar flashcards:', err)
    });
  }

  chequearCargaCompleta(): void {
    this.loaded = true;
  }

  // Children interaction methods
  seleccionarHijo(hijoId: number): void {
    if (this.hijoEditandoId) return;
    this.hijoSeleccionadoId = this.hijoSeleccionadoId === hijoId ? null : hijoId;
  }

  estaEnClase(hijoId: number): boolean {
    return this.relaciones.some((r: any) => r.estudiante && r.estudiante.id === hijoId)
      || this.getLeccionesDeHijo(hijoId).length > 0;
  }

  getLeccionesDeHijo(hijoId: number): any[] {
    return this.lecciones.filter((l: any) => l.estudiante && l.estudiante.id === hijoId);
  }

  getFlashcardsDeLeccion(leccionId: number): any[] {
    return this.flashcards.filter((f: any) => f.leccion && f.leccion.id === leccionId);
  }

  leccionCompletada(leccionId: number, hijoId: number): boolean {
    return this.progresos.some(
      (p: any) => p.leccion && p.leccion.id === leccionId && p.estudiante && p.estudiante.id === hijoId
    );
  }

  getFlashcardsProgreso(hijoId: number): string {
    const leccionesAsignadas = this.lecciones.filter((l: any) => l.estudiante && l.estudiante.id === hijoId);
    
    if (leccionesAsignadas.length === 0) {
      return 'No tiene pendientes';
    }

    let totalFlashcards = 0;
    let completedFlashcards = 0;

    leccionesAsignadas.forEach((lec: any) => {
      const numCards = lec.flashcards ? lec.flashcards.length : 0;
      totalFlashcards += numCards;

      const completada = this.progresos.some(
        (p: any) => p.leccion && p.leccion.id === lec.id && p.estudiante && p.estudiante.id === hijoId
      );

      if (completada) {
        completedFlashcards += numCards;
      }
    });

    if (totalFlashcards === 0 || completedFlashcards === totalFlashcards) {
      return 'No tiene pendientes';
    }

    return `${completedFlashcards}/${totalFlashcards}`;
  }

  // Inline profile editing methods
  iniciarEdicion(hijo: any): void {
    this.hijoEditandoId = hijo.id;
    this.editNombreCompleto = hijo.nombreCompleto || hijo.username;
    this.editUsername = hijo.username;
    this.editPassword = '';
  }

  cancelarEdicion(): void {
    this.hijoEditandoId = null;
  }

  guardarEdicion(hijo: any): void {
    if (!this.editNombreCompleto.trim() || !this.editUsername.trim()) {
      alert('El nombre y el usuario no pueden estar vacíos.');
      return;
    }

    const newPass = this.editPassword.trim();
    if (newPass !== '' && !/^\d{4}$/.test(newPass)) {
      alert('El PIN/Contraseña del niño debe ser de exactamente 4 dígitos numéricos.');
      return;
    }

    const payload = {
      nombreCompleto: this.editNombreCompleto.trim(),
      username: this.editUsername.trim(),
      correoElectronico: hijo.correoElectronico || `${this.editUsername.trim()}@student.innova.com`,
      contrasena: newPass !== '' ? newPass : 'dummyPassword123',
      metodoRegistro: hijo.metodoRegistro || 'PADRE',
      rolId: hijo.rol ? hijo.rol.id : 3,
      planSuscripcionId: hijo.planSuscripcion ? hijo.planSuscripcion.id : null,
      fotoPerfil: hijo.fotoPerfil || null
    };

    this.apiService.actualizarUsuario(hijo.id, payload).subscribe({
      next: (res) => {
        const idx = this.hijos.findIndex(h => h.id === hijo.id);
        if (idx !== -1) {
          this.hijos[idx] = { ...this.hijos[idx], ...res };
        }
        this.hijoEditandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar el perfil del hijo:', err);
        const msg = err.error?.message || err.error?.error || err.message || 'Error desconocido';
        alert('No se pudo guardar el cambio: ' + msg);
      }
    });
  }

  // Create child submission
  onSubmit(): void {
    this.submitAttempted = true;
    this.serverErrorMessage = '';

    if (this.alumnoForm.invalid) {
      return;
    }

    if (!localStorage.getItem('token')) {
      this.serverErrorMessage = 'No hay sesión activa. Inicia sesión nuevamente.';
      return;
    }

    const payload = {
      username: this.alumnoForm.value.nickname,
      pin: this.alumnoForm.value.pin
    };

    this.apiService.registrarAlumno(payload).subscribe({
      next: (res) => {
        this.hijos.push(res);
        this.registrationSuccess = true;
        this.alumnoForm.disable();
        setTimeout(() => { this.cargarDatos(); this.volverMenu(); }, 1500);
      },
      error: (err) => {
        console.error('Error al registrar alumno:', err);
        const msg = err.error?.message || err.error?.error || err.message;
        this.serverErrorMessage = msg || 'Error al comunicarse con el servidor';
      }
    });
  }


}

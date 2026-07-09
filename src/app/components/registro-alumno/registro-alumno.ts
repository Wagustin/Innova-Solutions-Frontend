import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';
import { PencilLoaderComponent } from '../pencil-loader/pencil-loader';

const ANIMALES = ['🐶','🐱','🐼','🦊','🐸','🦁','🐯','🐰','🐵','🐮','🐷','🦄','🐙','🦋','🐢','🦉','🐺','🦝','🐴','🐔','🐧','🐨','🦖','🐲'];

@Component({
  selector: 'app-registro-alumno',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, PencilLoaderComponent],
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
  isLoading = false;
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
    private apiService: ApiDataService,
    private cdr: ChangeDetectorRef
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

  // Navigation methods
  irARegistro(): void {
    this.inicializarFormulario();
    this.vista = 'registro';
  }

  irALista(): void {
    this.vista = 'lista';
    if (this.hijos.length === 0) {
      this.cargarDatos();
    }
  }

  volverMenu(): void {
    this.vista = 'menu';
    this.hijoSeleccionadoId = null;
    this.hijoEditandoId = null;
  }

  // Data loading methods
  todosUsuarios: any[] = [];
  cargarDatos(): void {
    const parentIdStr = localStorage.getItem('userId');
    const parentId = parentIdStr ? Number(parentIdStr) : null;

    if (parentId) {
      this.apiService.getUsuarios().subscribe({
        next: (users) => {
          this.todosUsuarios = users;
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
            this.todosUsuarios = users;
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

  getAvatar(hijo: any): string {
    return hijo.fotoPerfil || ANIMALES[(hijo.id * 7 + 13) % ANIMALES.length];
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
    const parentIdStr = localStorage.getItem('userId');
    const parentId = parentIdStr ? Number(parentIdStr) : null;
    const padre = this.todosUsuarios.find(u => u.id === parentId);
    const profesorId = padre?.creadoPorId;
    
    // Todas las lecciones que ha hecho este profesor
    let leccionesProfesor = this.lecciones.filter((l: any) => l.creador && l.creador.id === profesorId);
    
    // Si el profesor no ha hecho lecciones, usamos la por defecto (id 1)
    if (leccionesProfesor.length === 0) {
      return [{
        id: 1, // o 99999 dependiendo de la BD. En data.sql las defaults son leccion_id 1, 2, 3
        titulo: 'Lecciones por defecto'
      }];
    }
    
    // Si hay lecciones, devolvemos las que son para este alumno O para toda la clase (estudiante_id null)
    return leccionesProfesor.filter((l: any) => !l.estudiante || l.estudiante.id === hijoId);
  }

  getFlashcardsDeLeccion(leccionId: number): any[] {
    const fcs = this.flashcards.filter((f: any) => f.leccion && f.leccion.id === leccionId);
    if (fcs.length === 0 && (leccionId === 1 || leccionId === 2 || leccionId === 3)) {
      // Si no encontró y es la 1, tal vez la relación f.leccion no esté completa, buscamos por id
      return this.flashcards.filter(f => f.id === 1 || f.id === 2 || f.id === 3);
    }
    return fcs;
  }

  leccionCompletada(leccionId: number, hijoId: number): boolean {
    return this.progresos.some(
      (p: any) => p.leccion && p.leccion.id === leccionId && p.estudiante && p.estudiante.id === hijoId
    );
  }

  getFlashcardsProgreso(hijoId: number): string {
    const leccionesAsignadas = this.getLeccionesDeHijo(hijoId);
    
    if (leccionesAsignadas.length === 0) {
      return 'No tiene pendientes';
    }

    let totalFlashcards = 0;
    let completedFlashcards = 0;

    leccionesAsignadas.forEach((lec: any) => {
      const numCards = this.getFlashcardsDeLeccion(lec.id).length;
      totalFlashcards += numCards;

      const completada = this.leccionCompletada(lec.id, hijoId);

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
      pin: this.alumnoForm.value.pin,
      fotoPerfil: ANIMALES[this.hijos.length % ANIMALES.length]
    };

    this.isLoading = true;
    this.apiService.registrarAlumno(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        const animal = ANIMALES[(res.id * 7 + 13) % ANIMALES.length];
        res.fotoPerfil = animal;
        this.apiService.actualizarUsuario(res.id, {
          nombreCompleto: res.nombreCompleto || res.username,
          username: res.username,
          correoElectronico: res.correoElectronico || `${res.username}@student.innova.com`,
          contrasena: payload.pin,
          metodoRegistro: 'PADRE',
          rolId: res.rol?.id || 3,
          planSuscripcionId: res.planSuscripcion?.id || null,
          fotoPerfil: animal
        }).subscribe();
        this.hijos.push(res);
        this.registrationSuccess = true;
        this.alumnoForm.disable();
        setTimeout(() => {
          this.vista = 'lista';
          this.hijoSeleccionadoId = null;
          this.hijoEditandoId = null;
          this.registrationSuccess = false;
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al registrar alumno:', err);
        const msg = (err.error?.message || err.error?.error || err.message || '').toLowerCase();
        if (msg.includes('ya existe') || msg.includes('already exists') || msg.includes('duplicate') || msg.includes('username')) {
          this.serverErrorMessage = 'Elige otro nombre de usuario, ese ya está en uso.';
        } else {
          this.serverErrorMessage = msg || 'Error al comunicarse con el servidor';
        }
      }
    });
  }


}

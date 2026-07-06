import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiDataService } from '../../services/api-data.service';

const ANIMALES = ['🐶','🐱','🐼','🦊','🐸','🦁','🐯','🐰','🐵','🐮','🐷','🦄','🐙','🦋','🐢','🦉','🐺','🦝','🐴','🐔','🐧','🐨','🦖','🐲'];

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil implements OnInit {
  perfilForm!: FormGroup;
  userId = 1; // Fallback
  originalProfileData: any = {};
  fotoPerfil: string | null = null;
  saved = false;
  serverErrorMessage = '';
  showAvatarModal = false;
  isDragOver = false;

  get esAlumno(): boolean {
    return (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '') === 'ALUMNO';
  }

  get esPadre(): boolean {
    const rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    return rol === 'PADRE' || rol === 'TUTOR' || localStorage.getItem('rolId') === '2';
  }

  get inicial(): string {
    const nombre = localStorage.getItem('nombreCompleto') || localStorage.getItem('username') || '';
    return nombre.charAt(0).toUpperCase() || '?';
  }

  get isAnyFieldEnabled(): boolean {
    return Object.values(this.perfilForm.controls).some(c => c.enabled);
  }

  constructor(private fb: FormBuilder, private api: ApiDataService) {}

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.isAnyFieldEnabled) {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.perfilForm.patchValue(this.originalProfileData);
    this.perfilForm.disable();
  }

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    // Si no encontramos un userId numérico, busquemos qué guardó AuthService
    if (storedId && storedId !== 'undefined' && storedId !== 'null') {
      this.userId = parseInt(storedId, 10);
      if (isNaN(this.userId)) {
          this.userId = 1;
      }
    }
    this.fotoPerfil = ANIMALES[(this.userId * 7 + 13) % ANIMALES.length];
    
    this.perfilForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      correoElectronico: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      contrasena: ['', [Validators.minLength(8)]],
      metodoRegistro: ['MANUAL'],
      rolId: [1],
      planSuscripcionId: [1]
    });
    
    this.perfilForm.disable();

    this.fetchUserData();
  }

  fetchUserData() {
    const storedUsername = localStorage.getItem('username');
    // Si tenemos username pero el ID es sospechoso (ej. 1 por defecto), buscamos en la lista completa
    if (storedUsername && (!localStorage.getItem('userId') || isNaN(parseInt(localStorage.getItem('userId') || '', 10)))) {
       this.api.getUsuarios().subscribe({
          next: (users) => {
             const me = users.find((u: any) => u.username === storedUsername);
             if (me) {
                 this.userId = me.id;
                 localStorage.setItem('userId', me.id.toString());
                 this.patchUserData(me);
             } else {
                 this.fallbackFetch();
             }
          },
          error: () => this.fallbackFetch()
       });
    } else {
       this.fallbackFetch();
    }
  }

  fallbackFetch() {
    this.api.getUsuario(this.userId).subscribe({
      next: (res) => this.patchUserData(res),
      error: (err) => {
        console.error('Error fetching user with ID', this.userId, err);
        if (this.userId !== 1) {
            this.userId = 1;
            this.fallbackFetch(); // Retry con fallback
        }
      }
    });
  }

  patchUserData(res: any) {
    const resWithoutPass = { ...res };
    delete resWithoutPass.contrasena;
    this.originalProfileData = resWithoutPass;
    this.perfilForm.patchValue(resWithoutPass);
    if (res.nombreCompleto) {
      localStorage.setItem('nombreCompleto', res.nombreCompleto);
    }
    this.fotoPerfil = res.fotoPerfil || ANIMALES[(this.userId * 7 + 13) % ANIMALES.length] || null;
    if (this.fotoPerfil) {
      localStorage.setItem('fotoPerfil', this.fotoPerfil);
    }
  }

  onSave() {
    this.serverErrorMessage = '';
    if (this.perfilForm.valid) {
      // El backend requiere todos estos campos según el OpenAPI
      const payload = this.perfilForm.getRawValue();
      if (!payload.contrasena) payload.contrasena = 'dummyPassword123'; // Hack provisional si no cambiamos password

      this.api.actualizarUsuario(this.userId, payload).subscribe({
        next: () => {
          this.saved = true;
          this.perfilForm.disable();
          this.perfilForm.markAsPristine();
          setTimeout(() => this.saved = false, 3000);
        },
        error: (err) => {
          console.error('Error updating user', err);
          this.serverErrorMessage = err.error?.message || err.error?.error || err.message || 'Error al actualizar el perfil';
        }
      });
    }
  }

  enableField(fieldName: string) {
    this.perfilForm.get(fieldName)?.enable();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFile(event.target.files[0]);
    }
  }

  private handleFile(file: File) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPerfil = e.target.result;
        this.closeModal();
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.showAvatarModal = true;
  }

  closeModal() {
    this.showAvatarModal = false;
  }
}

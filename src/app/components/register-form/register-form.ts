import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

import { PencilLoaderComponent } from '../pencil-loader/pencil-loader';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PencilLoaderComponent],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.css']
})
export class RegisterForm implements OnInit {
  registerForm!: FormGroup;
  submitAttempted = false;
  registrationSuccess = false;
  isLoading = false;
  serverErrorMessage = '';
  
  selectedRoleName = 'USUARIO';
  selectedRoleId = 1;
  isProfesor = false;
  isPadre = false;
  isAlumno = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiDataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.selectedRoleName = params['role'];
      }
      if (params['roleId']) {
        this.selectedRoleId = +params['roleId'];
      }
      const upper = this.selectedRoleName.toUpperCase();
      this.isProfesor = this.selectedRoleId === 1 || upper === 'PROFESOR';
      this.isPadre = this.selectedRoleId === 2 || upper === 'PADRE';
      this.isAlumno = this.selectedRoleId === 3 || upper === 'ALUMNO';
      this.buildForm();
    });
  }

  private buildForm(): void {
    let controls: any;

    if (this.isAlumno) {
      controls = {
        padreUsername: ['', [Validators.required, Validators.minLength(3)]],
        nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        contrasena: ['', [Validators.required, Validators.minLength(4)]]
      };
    } else {
      controls = {
        nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        correoElectronico: ['', [Validators.required, Validators.email]],
        contrasena: ['', [Validators.required, Validators.minLength(8)]]
      };

      if (this.isPadre) {
        controls.profesorUsername = ['', [Validators.required, Validators.minLength(3)]];
      } else {
        controls.planSuscripcionId = ['', Validators.required];
      }
    }

    this.registerForm = this.fb.group(controls);
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.serverErrorMessage = '';
    
    if (this.registerForm.invalid) {
      this.registrationSuccess = false;
      return;
    }

    const payload: any = {
      metodoRegistro: 'MANUAL',
      rolId: this.selectedRoleId
    };

    if (this.isAlumno) {
      payload.padreUsername = this.registerForm.value.padreUsername;
      payload.nombreCompleto = this.registerForm.value.nombreCompleto;
      payload.username = this.registerForm.value.username;
      payload.contrasena = this.registerForm.value.contrasena;
    } else {
      payload.nombreCompleto = this.registerForm.value.nombreCompleto;
      payload.username = this.registerForm.value.username;
      payload.correoElectronico = this.registerForm.value.correoElectronico;
      payload.contrasena = this.registerForm.value.contrasena;

      if (this.isPadre) {
        payload.profesorUsername = this.registerForm.value.profesorUsername;
      } else {
        payload.planSuscripcionId = parseInt(this.registerForm.value.planSuscripcionId, 10);
      }
    }
    
    localStorage.setItem('rol', this.selectedRoleName);
    localStorage.setItem('rolId', String(this.selectedRoleId));

    this.isLoading = true;
    this.apiService.registrarUsuario(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.registrationSuccess = true;
        this.registerForm.disable();
        setTimeout(() => this.goToLogin(), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en registro:', err);
        this.serverErrorMessage = err.error?.message || err.message || 'Error al comunicarse con el servidor';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.router.navigate(['/role']);
  }
}

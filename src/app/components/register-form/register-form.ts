import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.css']
})
export class RegisterForm implements OnInit {
  registerForm!: FormGroup;
  submitAttempted = false;
  registrationSuccess = false;
  serverErrorMessage = '';
  
  selectedRoleName = 'USUARIO';
  selectedRoleId = 1;
  isPadre = false;
  isEstudiante = false;

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
      this.isPadre = upper.includes('PADRE') || upper.includes('TUTOR');
      this.isEstudiante = upper.includes('ESTUDIANTE') || upper.includes('ALUMNO');
      this.buildForm();
    });
  }

  private buildForm(): void {
    let controls: any;

    if (this.isEstudiante) {
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

    if (this.isEstudiante) {
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
    
    this.apiService.registrarUsuario(payload).subscribe({
      next: (res) => {
        this.registrationSuccess = true;
        this.registerForm.disable();
        setTimeout(() => this.goToLogin(), 2000);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.serverErrorMessage = err.error?.message || err.message || 'Error al comunicarse con el servidor';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

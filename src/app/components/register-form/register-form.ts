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
    });

    this.registerForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      planSuscripcionId: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.serverErrorMessage = '';
    
    if (this.registerForm.invalid) {
      this.registrationSuccess = false;
      return;
    }

    const payload = {
      ...this.registerForm.value,
      metodoRegistro: 'MANUAL',
      rolId: this.selectedRoleId,
      planSuscripcionId: parseInt(this.registerForm.value.planSuscripcionId, 10)
    };
    
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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-registro-alumno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro-alumno.html',
  styleUrls: ['./registro-alumno.css']
})
export class RegistroAlumno implements OnInit {
  alumnoForm!: FormGroup;
  submitAttempted = false;
  registrationSuccess = false;
  serverErrorMessage = '';

  avatares = ['🐶', '🐱', '🐼', '🐸', '🦊', '🐯', '🐰', '🐻'];
  selectedAvatar = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiDataService
  ) {}

  ngOnInit(): void {
    this.alumnoForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  seleccionarAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.serverErrorMessage = '';

    if (this.alumnoForm.invalid || !this.selectedAvatar) {
      return;
    }

    const padreId = localStorage.getItem('userId');

    const payload = {
      nickname: this.alumnoForm.value.nickname,
      pin: this.alumnoForm.value.pin,
      avatar: this.selectedAvatar,
      padreId: padreId ? parseInt(padreId, 10) : null
    };

    this.apiService.registrarAlumno(payload).subscribe({
      next: (res) => {
        this.registrationSuccess = true;
        this.alumnoForm.disable();
        setTimeout(() => this.volverDashboard(), 2000);
      },
      error: (err) => {
        console.error('Error al registrar alumno:', err);
        this.serverErrorMessage = err.error?.message || err.message || 'Error al comunicarse con el servidor';
      }
    });
  }

  volverDashboard(): void {
    this.router.navigate(['/padre/dashboard']);
  }
}

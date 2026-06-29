import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  submitAttempted = false;
  loginSuccess = false;
  hasAuthError = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (localStorage.getItem('token') != null) {
      localStorage.clear();
      console.log("Token y items eliminados");
    }
    
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.hasAuthError = false;
    
    if (this.loginForm.invalid) {
      this.hasAuthError = true;
      return;
    }

    const val = this.loginForm.value;
    
    this.authService.login(val.username, val.password).subscribe({
      next: (res) => {
        this.loginSuccess = true;
        this.loginForm.disable();
        
        setTimeout(() => {
          const rol = localStorage.getItem('rol')?.toUpperCase() || '';
          if (rol.includes('PADRE')) {
            this.router.navigate(['/padre/dashboard']);
          } else {
            this.router.navigate(['/inicio']);
          }
        }, 1500);
      },
      error: (err) => {
        this.hasAuthError = true;
        console.error('Error al iniciar sesión', err);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/role']);
  }
}

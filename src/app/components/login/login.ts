import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
  sessionExpired = false;
  idleTimeout = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.sessionExpired = this.route.snapshot.queryParams['expired'] === '1';
    this.idleTimeout = this.route.snapshot.queryParams['idle'] === 'true';
  }

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
          const rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
          const rolId = localStorage.getItem('rolId');
          if (rol === 'PADRE' || rolId === '2') {
            this.router.navigate(['/padre/dashboard']);
          } else if (rol === 'ALUMNO' || rolId === '3') {
            this.router.navigate(['/inicio']);
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

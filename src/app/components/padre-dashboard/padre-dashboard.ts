import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-padre-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboard {
  username = localStorage.getItem('username') || '';

  constructor(private router: Router) {}

  registrarHijo(): void {
    this.router.navigate(['/padre/registrar-alumno']);
  }

  irInicio(): void {
    this.router.navigate(['/inicio']);
  }
}

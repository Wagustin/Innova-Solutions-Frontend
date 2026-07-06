import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acerca-de',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acerca-de.html',
  styleUrls: ['./acerca-de.css']
})
export class AcercaDe implements OnInit {
  esAlumno = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    if (rol === 'ALUMNO') {
      this.esAlumno = true;
      this.router.navigate(['/inicio']);
    }
  }
}

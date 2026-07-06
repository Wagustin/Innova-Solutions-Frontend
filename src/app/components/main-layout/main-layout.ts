import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

const ANIMALES = ['🐶','🐱','🐼','🦊','🐸','🦁','🐯','🐰','🐵','🐮','🐷','🦄','🐙','🦋','🐢','🦉','🐺','🦝','🐴','🐔','🐧','🐨','🦖','🐲'];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  isProfileMenuOpen = false;
  @ViewChild('profileMenuContainer') profileMenuContainer!: ElementRef;

  get esAlumno(): boolean {
    return (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '') === 'ALUMNO';
  }

  get fotoPerfil(): string | null {
    if (!this.esAlumno) return null;
    const stored = localStorage.getItem('fotoPerfil');
    if (stored) return stored;
    const uid = localStorage.getItem('userId');
    if (uid) {
      const id = Number(uid);
      if (!isNaN(id)) {
        return ANIMALES[(id * 7 + 13) % ANIMALES.length];
      }
    }
    return null;
  }

  get inicial(): string {
    const nombre = localStorage.getItem('nombreCompleto') || localStorage.getItem('username') || '';
    return nombre.charAt(0).toUpperCase() || '?';
  }

  get puedeCrear(): boolean {
    const rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    const rolId = localStorage.getItem('rolId');
    return rol === 'PROFESOR' || rol === 'MAESTRO' || rolId === '1';
  }

  get esProfesor(): boolean {
    return this.puedeCrear;
  }

  get esPadre(): boolean {
    const rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    return rol === 'PADRE' || rol === 'TUTOR' || localStorage.getItem('rolId') === '2';
  }

  get getInicioLink(): string {
    return this.esPadre ? '/padre/dashboard' : '/inicio';
  }

  constructor(private router: Router) {}

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  logout() {
    this.closeProfileMenu();
    localStorage.clear();
    this.router.navigate(['/welcome']);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isProfileMenuOpen && this.profileMenuContainer && !this.profileMenuContainer.nativeElement.contains(event.target)) {
      this.closeProfileMenu();
    }
  }
}

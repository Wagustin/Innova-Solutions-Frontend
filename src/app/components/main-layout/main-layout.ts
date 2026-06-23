import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

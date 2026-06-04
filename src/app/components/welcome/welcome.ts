import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css'],
})
export class Welcome {
  constructor(private router: Router) {}

  goToRoleSelection() {
    this.router.navigate(['/role']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

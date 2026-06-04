import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.css'],
})
export class RoleSelection {
  constructor(private router: Router) {}

  goToRegister(roleName: string, roleId: number) {
    this.router.navigate(['/register'], { queryParams: { role: roleName, roleId: roleId } });
  }
}

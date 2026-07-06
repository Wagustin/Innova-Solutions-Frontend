import { Component } from '@angular/core';
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
}

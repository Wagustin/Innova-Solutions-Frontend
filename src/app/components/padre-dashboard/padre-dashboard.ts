import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-padre-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboard implements OnInit {
  username = localStorage.getItem('username') || '';

  constructor() {}

  ngOnInit(): void {}
}

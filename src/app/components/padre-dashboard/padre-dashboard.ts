import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-padre-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboard implements OnInit {
  username = localStorage.getItem('username') || '';
  reporteDificultad: any[] = [];

  constructor(private apiService: ApiDataService) {}

  ngOnInit(): void {
    this.apiService.getReporteDificultad().subscribe({
      next: (data) => {
        this.reporteDificultad = data;
      },
      error: (err) => {
        console.error('Error fetching difficulty report', err);
      }
    });
  }
}

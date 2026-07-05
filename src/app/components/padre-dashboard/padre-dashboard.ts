import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

export interface DificultadData {
  dificultad: string;
  total: number;
  cssClass?: string;
  widthPercent?: number;
}

@Component({
  selector: 'app-padre-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboard implements OnInit {
  username = localStorage.getItem('username') || '';
  reporteDificultad: DificultadData[] = [];

  constructor(private apiService: ApiDataService) {}

  ngOnInit(): void {
    this.apiService.getReporteDificultad().subscribe({
      next: (data) => {
        const maxTotal = data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;
        this.reporteDificultad = data.map(d => ({
          dificultad: d.dificultad,
          total: d.total,
          cssClass: d.dificultad ? d.dificultad.toLowerCase() : '',
          widthPercent: maxTotal > 0 ? (d.total / maxTotal) * 100 : 0
        }));
      },
      error: (err) => {
        console.error('Error fetching difficulty report', err);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

interface DificultadData {
  dificultad: string;
  total: number;
  cssClass: string;
  widthPercent: number;
}

@Component({
  selector: 'app-padre-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboard implements OnInit {
  username = localStorage.getItem('username') || '';
  reporteDificultad: DificultadData[] = [];

  constructor(private apiService: ApiDataService) {}

  ngOnInit(): void {
    this.apiService.getReporteDificultad().subscribe({
      next: (data: any[]) => {
        const maxTotal = data.length > 0 ? Math.max(...data.map((d: any) => d.total)) : 0;
        this.reporteDificultad = data.map((d: any) => ({
          dificultad: d.dificultad,
          total: d.total,
          cssClass: d.dificultad ? d.dificultad.toLowerCase() : '',
          widthPercent: maxTotal > 0 ? (d.total / maxTotal) * 100 : 0
        }));
      },
      error: (err: any) => {
        console.error('Error fetching difficulty report', err);
      }
    });
  }
}

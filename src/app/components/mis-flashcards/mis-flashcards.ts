import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-mis-flashcards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-flashcards.html',
  styleUrls: ['./mis-flashcards.css']
})
export class MisFlashcards implements OnInit {
  flashcards: any[] = [];

  constructor(private apiService: ApiDataService) {}

  ngOnInit(): void {
    this.apiService.getFlashcards().subscribe({
      next: (data) => {
        this.flashcards = data;
      },
      error: (err) => {
        console.error('Error fetching flashcards:', err);
      }
    });
  }
}

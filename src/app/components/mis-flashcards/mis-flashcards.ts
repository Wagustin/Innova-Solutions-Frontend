import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  loading = true;
  errorMsg = '';

  constructor(private apiService: ApiDataService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getFlashcards().subscribe({
      next: (data) => {
        this.flashcards = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMsg = 'No se pudieron cargar las flashcards.';
        this.cdr.detectChanges();
      }
    });
  }

  irAResponder(id: number) {
    this.router.navigate(['/responder', id]);
  }
}

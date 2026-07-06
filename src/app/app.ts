import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdleTimeoutService } from './services/idle-timeout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Innova-Solutions-Frontend');

  constructor(private idleTimeoutService: IdleTimeoutService) {
    this.idleTimeoutService.startWatching();
  }
}

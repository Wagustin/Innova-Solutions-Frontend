import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  private timeoutId: any;
  // 20 minutes in milliseconds
  private readonly IDLE_TIMEOUT_MS = 20 * 60 * 1000;

  constructor(private router: Router, private ngZone: NgZone) {}

  startWatching() {
    this.resetTimer();
    
    // Listen to user activity events
    window.addEventListener('mousemove', () => this.resetTimer());
    window.addEventListener('mousedown', () => this.resetTimer());
    window.addEventListener('keypress', () => this.resetTimer());
    window.addEventListener('DOMMouseScroll', () => this.resetTimer());
    window.addEventListener('mousewheel', () => this.resetTimer());
    window.addEventListener('touchmove', () => this.resetTimer());
    window.addEventListener('MSPointerMove', () => this.resetTimer());
  }

  private resetTimer() {
    // Run outside Angular zone to prevent triggering change detection on every mouse move
    this.ngZone.runOutsideAngular(() => {
      clearTimeout(this.timeoutId);
      
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => this.logoutDueToInactivity());
      }, this.IDLE_TIMEOUT_MS);
    });
  }

  private logoutDueToInactivity() {
    // Only logout if the user is actually logged in
    if (localStorage.getItem('token')) {
      console.warn('Cerrando sesión por inactividad...');
      localStorage.clear();
      this.router.navigate(['/login'], { queryParams: { idle: 'true' } });
    }
  }
}

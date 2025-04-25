import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './app/pages/auth/service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  private authService = inject(AuthService);

  constructor() {
    // ✅ Init session status on app load
    const token = this.authService.getToken();
    this.authService.isLoggedIn$.next(!!token);
  }
}

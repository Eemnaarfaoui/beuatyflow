import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth/service/auth.service';

@Injectable({ providedIn: 'root' })
export class PageAccessGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['requiredRole'];
    const userRole = this.authService.getUserRole()?.toLowerCase();

    if (!userRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // Admin can access everything
    if (userRole === 'admin') {
        
      return true;
    }

    // Normal role check
    if (userRole === requiredRole) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}

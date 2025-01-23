import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';


export function authGuard(): Observable<boolean | UrlTree> {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return authService.checkAuthStatus().pipe(
        map((isAuthenticated: boolean) => {
          if (isAuthenticated) {
            return true;
          } else {
            return router.createUrlTree(['/login']);
          }
        }),
    );
}


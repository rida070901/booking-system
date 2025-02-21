import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, _state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

    if (authService.isAuthenticated()) {
      return true;
    } else {
      //router.navigate(['/login']);
      console.log('auth.guard: UNAUTHORIZED')
      return false;
    }

};

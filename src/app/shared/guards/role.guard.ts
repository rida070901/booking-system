import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, _state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role']; //getting role from routes data.role
  const role = authService.getRole();

    if (role && role === expectedRole) {
      return true;
    } else {
      //TODO: error msg 'unauthorized route'
      //router.navigate(['/login']); //redirect when role mismatch
      console.log('role.guard: UNAUTHORIZED')
      return false;
    }

};

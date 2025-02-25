import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, _state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role']; //getting role from routes data.role
  const role = authService.userRole();

    if (role && role === expectedRole) {
      return true;
    } else {
      //TODO: error msg 'unauthorized route'
      console.log('role.guard: UNAUTHORIZED')
      router.navigate(['/home']); //redirect when role mismatch
      return false;
    }

};

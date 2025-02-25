import { inject, NgZone } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoginComponent } from '../../login/login.component';

let modalRef: BsModalRef | undefined; // ensure modal opens once

export const authGuard: CanActivateFn = (_route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const modalService = inject(BsModalService);
  // const ngZone = inject(NgZone);

    if (authService.isAuthenticated()) {
      return true;
    } else {
      console.log('auth.guard: UNAUTHORIZED')
      authService.setRedirectUrl(state.url); // store an attempted URL
      // ngZone.run(() => {
        if (!modalRef) {
          modalRef = modalService.show(LoginComponent);
          modalRef.onHidden?.subscribe(() => (modalRef = undefined)); // reset modal ref
        }
      // });

      return false;
    }

};

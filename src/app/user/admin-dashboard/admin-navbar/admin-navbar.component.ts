import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginComponent } from '../../../login/login.component';
import { ConfirmLogoutModalComponent } from '../../shared/confirm-logout/confirm-logout-modal.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {

  private authService = inject(AuthService);
  private modalService = inject(BsModalService);

  islogged = signal(this.authService.isAuthenticated());
  userRole = computed(() => (this.islogged() ? this.authService.userRole() : null));

  //automatically keeps islogged in sync with auth state
  private syncAuthState = effect(() => { //needed for check when token expires
    this.islogged.set(this.authService.isAuthenticated());
  });

  openLoginModal() {
    this.modalService.show(LoginComponent);
  }

  openLogoutModal() {
    this.modalService.show(ConfirmLogoutModalComponent);
  }

}

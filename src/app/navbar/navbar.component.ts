import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoginComponent } from '../login/login.component';
import { ConfirmLogoutModalComponent } from '../user/shared/confirm-logout/confirm-logout-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  darkMode = input(false);
  homeText = input(false);
  fixed = input(false);

  private authService = inject(AuthService);
  private modalService = inject(BsModalService);

  islogged = signal(this.authService.isAuthenticated());
  userRole = computed(() => (this.islogged() ? this.authService.userRole() : null));
  isAdmin = computed(() => this.userRole() === 'Admin');
  isUser = computed(() => this.userRole() === 'User');


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

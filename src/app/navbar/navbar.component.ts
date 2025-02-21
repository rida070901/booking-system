import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoginComponent } from '../login/login.component';
import { ConfirmLogoutModalComponent } from '../user/shared/confirm-logout/confirm-logout-modal.component';

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
  private modalRef?: BsModalRef;
  private userRole = this.authService.getRole();

  islogged = this.authService.isAuthenticated();
  isAdmin: boolean = this.userRole === 'Admin';
  isUser: boolean = this.userRole === 'User';

  openLoginModal() {
    this.modalRef = this.modalService.show(LoginComponent);
  }

  openLogoutModal() {
    this.modalRef = this.modalService.show(ConfirmLogoutModalComponent);
  }

}

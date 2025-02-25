import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [CommonModule ],
  templateUrl: './confirm-logout-modal.component.html',
  styleUrl: './confirm-logout-modal.component.css'
})
export class ConfirmLogoutModalComponent {

  private bsModalRef = inject(BsModalRef);
  private authService = inject(AuthService);

  isLoggingOut = false;

  async onLogout() {
    this.isLoggingOut = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // delay is for loading effect only
      this.authService.logout();
      this.bsModalRef.hide();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.isLoggingOut = false;
    }
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}

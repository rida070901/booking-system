import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private bsModalRef = inject(BsModalRef);

  isLoading = false;

  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  loginData: User | null = null;

  loginForm = new FormGroup({
    email: new FormControl(
      '',
      {validators: [Validators.email, Validators.required]}
    ),
    password: new FormControl(
      '',
      {validators: [Validators.required]}
    )
  });


  onLogin() {
    this.isLoading = true;
    if(this.loginForm.valid) {
      const { email, password } = this.loginForm.value as { email: string; password: string };
    }
      const sub = this.authService.login(this.loginForm.controls.email.value ?? "", this.loginForm.controls.password.value ?? "")
      .subscribe({
        next: (response) => {
          console.log('login response:', response);
          this.authService.setToken(response.token);
          this.authService.setUserId(response.id);
          if(this.authService.getRole() == 'Admin') {
            this.router.navigate(['/admin']); //redirect after login
          }
          if(this.authService.getRole() == 'User') {
            this.router.navigate(['/user']); //redirect after login
          }
        },
        error: (err) => alert('Login failed: ' + err.message),
        complete: () => {
          this.isLoading = false;
          this.closeModal();
        }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());

  }

  closeModal() {
    this.bsModalRef.hide();
  }

}

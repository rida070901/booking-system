import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private bsModalRef = inject(BsModalRef);
  isLoading = false;
  isLoginMode = true;

  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  loginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.email, Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  registerForm = new FormGroup({
    username: new FormControl('', { validators: [Validators.required] }),
    firstName: new FormControl('', { validators: [Validators.required] }),
    lastName: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl('', { validators: [Validators.email, Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/)] }),
    phoneNumber: new FormControl('', { validators: [Validators.required] })
  });

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    const { email, password } = this.loginForm.value as { email: string; password: string };
    this.authService.login(email, password).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setUserId(response.id);
        const role = this.authService.getRole();
        this.router.navigate([role === 'Admin' ? '/admin' : '/user']);
      },
      error: (err) => console.log('Login failed: ' + err.message),
      complete: () => {
        this.isLoading = false;
        this.closeModal();
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;

    const { username, firstName, lastName, email, password, phoneNumber } = this.registerForm.value as {
      username: string; firstName: string; lastName: string; email: string; password: string; phoneNumber: string;
    };

    this.authService.register({ username, firstName, lastName, email, password, phoneNumber }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('register response: ', response);
          this.closeModal();
          //this.isLoginMode = true;
          //this.loginForm.controls.email.setValue(email);
          //this.registerForm.reset();
        },
        error: (err) => {
          if (err.status === 400 && err.error?.errors) {
            const errors: string[] = err.error.errors;
            if (errors.includes('Username is not available.')) {
              this.registerForm.controls.username.setErrors({ usernameTaken: true });
            }
            if (errors.includes('Email address is already in use.')) {
              this.registerForm.controls.email.setErrors({ emailTaken: true });
            }
          } else {
            console.log('Registration failed: ' + (err.error?.errors?.[0] ?? err.message));
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          this.closeModal();
        }
      });
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}

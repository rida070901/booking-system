import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegisterRequest } from '../shared/models/register-request.model';
import { LoginRequest } from '../shared/models/login.model';
import { passwordMatchValidator } from './password-match.validator';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private bsModalRef = inject(BsModalRef);
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isLoading = signal<boolean>(false);
  isLoginMode = signal<boolean>(true);

  loginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.email, Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  registerForm = new FormGroup({
    username: new FormControl('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)] }),
    firstName: new FormControl('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)] }),
    lastName: new FormControl('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)] }),
    email: new FormControl('', { validators: [Validators.email, Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/)] }),
    confirmPassword: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/)] }),
    phoneNumber: new FormControl('', { validators: [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)] })
  }, { validators: passwordMatchValidator }); //validator added to form so it checks both psw fields for validation

  toggleMode() { //switch login - register mode in same modal
    this.isLoginMode.set(!this.isLoginMode());
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    const loginData: LoginRequest = this.loginForm.value as LoginRequest;
    this.authService.login(loginData).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        const role = this.authService.userRole();
        const redirectUrl = this.authService.getRedirectUrl();
        this.authService.clearRedirectUrl();
        //if redirectUrl exists go there -> else default to role-based route
        this.router.navigate([redirectUrl ?? (role === 'Admin' ? '/admin' : '/user')]);
      },
      error: (err) => this.handleFormErrors(err, this.loginForm),
      complete: () => {
        this.isLoading.set(false);
        this.closeModal();
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    const registerData: RegisterRequest = this.registerForm.value as RegisterRequest;
    this.authService.register(registerData).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('register response: ', response);
        },
        error: (err) => this.handleFormErrors(err, this.registerForm),
        complete: () => {
          this.isLoading.set(false);
          this.toggleMode();
          this.loginForm.controls.email.setValue(registerData.email);
          this.registerForm.reset();
        }
      });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  private handleFormErrors(err: any, form: FormGroup) {
    if (err.status === 400 && err.error?.errors) {
      const errors: string[] = err.error.errors;
      if (errors.includes('Username is not available.')) {
        form.controls['username'].setErrors({ usernameTaken: true });
      }
      if (errors.includes('Email address is already in use.')) {
        form.controls['email'].setErrors({ emailTaken: true });
      }
    } else if (err.status === 401) {
      form.controls['password'].setErrors({ invalidCredentials: true });
    } else {
      console.error('Error: ', err.message ?? err);
    }
    this.isLoading.set(false);
  }

}

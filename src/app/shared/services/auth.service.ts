import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { RegisterRequest } from '../models/register-request.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs';
import { LoginComponent } from '../../login/login.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private modalService = inject(BsModalService);
  private jwtHelper = new JwtHelperService();
  private baseUrl = environment.apiUrl;

  private token = signal<string | null>(localStorage.getItem('authToken'));
  private userId = signal<string | null>(localStorage.getItem('userId'));
  private redirectUrl: string | null = null;

  // sgns for reactive authentication and role management
  private isLoggedIn = computed(() => !!this.token() && !this.jwtHelper.isTokenExpired(this.token()!));
  userRole = computed(() => {
    const t = this.token();
    return t ? this.jwtHelper.decodeToken(t)?.role || null : null;
  });

  //replaced by using signals --> better approach
  // private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  // isLoggedIn$ = this.isLoggedInSubject.asObservable();


  constructor() { //to sync token and userId with localStorage changes if needed
    effect(() => {
      if (!this.isLoggedIn()) {
        this.clearSession();
      }
    });
  }


  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}${environment.endpoints.auth.login}`, request)
    .pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUserId(response.id);
        // this.isLoggedInSubject.next(true); // emit login event
      })
    );
  }

  private setToken(token: string) {
    this.token.set(token);
    localStorage.setItem('authToken', token);
  }

  private setUserId(userId: string) {
    this.userId.set(userId);
    localStorage.setItem('userId', userId.toString());
  }

  getToken() {
    return this.token() || localStorage.getItem('authToken');
  }

  getUserId() {
    return this.userId() || localStorage.getItem('userId');
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  logout() {
    // this.isLoggedInSubject.next(false); // emit logout event
    if(this.userRole() === 'User'){
      console.log('inside user role check')
      this.clearSession();
      this.router.navigate(['/home']);
    }
    else if(this.userRole() === 'Admin') {
      console.log('inside admin role check')
      this.clearSession();
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate(['/admin']);
      });
      // this.modalService.show(LoginComponent);
    }
  }

  private triggerLoginModal() {
    setTimeout(() => {
      this.modalService.show(LoginComponent);
    }, 100); // Small delay to ensure UI updates first
  }

  private clearSession() {
    this.token.set(null);
    localStorage.removeItem('authToken');
    this.userId.set(null);
    localStorage.removeItem('userId');
  }

  register(request: RegisterRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}${environment.endpoints.auth.register}`, request);
  }


  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  clearRedirectUrl() {
    this.redirectUrl = null;
  }

}

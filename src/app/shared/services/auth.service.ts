import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtHelper = new JwtHelperService();
  private token: string | null = null;
  private userId: string | null = null;


  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}${environment.endpoints.auth.login}`, { email, password });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId.toString());
  }

  getUserId() {
    return this.userId || localStorage.getItem('userId');
  }

  getRole() {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.role || null; //extracts role safely
    }
    return null;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken'); //clear token on logout
    this.userId = null;
    localStorage.removeItem('userId');
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  register(request: RegisterRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Register`, request);
  }
}

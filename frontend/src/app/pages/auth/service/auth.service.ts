import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environment/environment';
import {jwtDecode} from "jwt-decode";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private apiUrl = environment.apiUrl;

  public isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedIn$.next(true);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/landing']);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
  
  initSession() {
    const token = this.getToken();
    this.isLoggedIn$.next(!!token);
  }
  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  getUserPages(): string[] {
    const decoded = this.decodeToken();
    return decoded?.pages || [];
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    
    return decoded?.role || null;
  }
}

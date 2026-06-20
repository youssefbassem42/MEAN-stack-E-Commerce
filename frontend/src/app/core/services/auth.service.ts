import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(this.loadUser());
  private readonly _accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${apiConfig.baseUrl}/auth/login`, payload).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._accessToken.set(res.accessToken);
        this._user.set(res.user);
      }),
    );
  }

  logout(): Observable<MessageResponse> {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/logout`, { refreshToken }).pipe(
      tap(() => this.clearSession()),
    );
  }

  verifyEmail(token: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/verify-email`, { token });
  }

  resendVerification(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${apiConfig.baseUrl}/auth/reset-password`, { token, password });
  }

  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._accessToken.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

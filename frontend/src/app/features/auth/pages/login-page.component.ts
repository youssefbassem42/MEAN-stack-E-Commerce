import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="auth-logo-icon">EC</span>
          <span class="auth-logo-text">Commerce</span>
        </div>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" id="login-form" novalidate>
          <div class="field">
            <label for="login-email" class="field-label">Email</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              class="field-input"
              placeholder="you@example.com"
              autocomplete="email"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="field-error">Enter a valid email.</span>
            }
          </div>

          <div class="field">
            <label for="login-password" class="field-label">Password</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Password must be at least 8 characters.</span>
            }
          </div>

          <div class="auth-actions">
            <a routerLink="/auth/forgot-password" class="auth-link">Forgot password?</a>
          </div>

          @if (error()) {
            <div class="auth-alert auth-alert--error" role="alert">{{ error() }}</div>
          }
          @if (success()) {
            <div class="auth-alert auth-alert--success" role="alert">{{ success() }}</div>
          }

          <button id="login-submit" type="submit" class="auth-btn" [disabled]="loading()">
            @if (loading()) { Signing in… } @else { Sign In }
          </button>
        </form>

        <p class="auth-footer-text">
          Don't have an account?
          <a routerLink="/auth/register" class="auth-link">Create one</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}

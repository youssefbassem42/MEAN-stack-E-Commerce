import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
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

        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">We'll send a recovery link to your email</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" id="forgot-password-form" novalidate>
          <div class="field">
            <label for="forgot-email" class="field-label">Email</label>
            <input
              id="forgot-email"
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

          @if (error()) {
            <div class="auth-alert auth-alert--error" role="alert">{{ error() }}</div>
          }
          @if (success()) {
            <div class="auth-alert auth-alert--success" role="alert">{{ success() }}</div>
          }

          <button id="forgot-submit" type="submit" class="auth-btn" [disabled]="loading()">
            @if (loading()) { Sending… } @else { Send Recovery Email }
          </button>
        </form>

        <p class="auth-footer-text">
          <a routerLink="/auth/login" class="auth-link">← Back to sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}

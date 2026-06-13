import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password-page',
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

        <h1 class="auth-title">New password</h1>
        <p class="auth-subtitle">Choose a strong password for your account</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" id="reset-password-form" novalidate>
          <div class="field">
            <label for="reset-password" class="field-label">New password</label>
            <input
              id="reset-password"
              type="password"
              formControlName="password"
              class="field-input"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Password must be at least 8 characters.</span>
            }
          </div>

          <div class="field">
            <label for="reset-confirm" class="field-label">Confirm new password</label>
            <input
              id="reset-confirm"
              type="password"
              formControlName="confirmPassword"
              class="field-input"
              placeholder="Repeat password"
              autocomplete="new-password"
            />
            @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <span class="field-error">Passwords do not match.</span>
            }
          </div>

          @if (error()) {
            <div class="auth-alert auth-alert--error" role="alert">{{ error() }}</div>
          }
          @if (success()) {
            <div class="auth-alert auth-alert--success" role="alert">
              {{ success() }}
              <a routerLink="/auth/login" class="auth-link" style="display:block;margin-top:0.5rem">Sign in →</a>
            </div>
          }

          <button id="reset-submit" type="submit" class="auth-btn" [disabled]="loading() || !!success()">
            @if (loading()) { Resetting… } @else { Reset Password }
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('No reset token found in URL. Please request a new reset link.');
    }
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { password } = this.form.getRawValue();
    this.authService.resetPassword(this.token, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Reset failed. The link may have expired.');
      },
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register-page',
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

        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start shopping with us today</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" id="register-form" novalidate>
          <div class="field-row">
            <div class="field">
              <label for="register-firstname" class="field-label">First name</label>
              <input id="register-firstname" type="text" formControlName="firstName" class="field-input" placeholder="Jane" autocomplete="given-name" />
              @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                <span class="field-error">First name is required.</span>
              }
            </div>
            <div class="field">
              <label for="register-lastname" class="field-label">Last name</label>
              <input id="register-lastname" type="text" formControlName="lastName" class="field-input" placeholder="Doe" autocomplete="family-name" />
              @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                <span class="field-error">Last name is required.</span>
              }
            </div>
          </div>

          <div class="field">
            <label for="register-email" class="field-label">Email</label>
            <input id="register-email" type="email" formControlName="email" class="field-input" placeholder="you@example.com" autocomplete="email" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="field-error">Enter a valid email.</span>
            }
          </div>

          <div class="field">
            <label for="register-password" class="field-label">Password</label>
            <input id="register-password" type="password" formControlName="password" class="field-input" placeholder="Min. 8 characters" autocomplete="new-password" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Password must be at least 8 characters.</span>
            }
          </div>

          <div class="field">
            <label for="register-confirm" class="field-label">Confirm password</label>
            <input id="register-confirm" type="password" formControlName="confirmPassword" class="field-input" placeholder="Repeat password" autocomplete="new-password" />
            @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <span class="field-error">Passwords do not match.</span>
            }
          </div>

          @if (error()) {
            <div class="auth-alert auth-alert--error" role="alert">{{ error() }}</div>
          }
          @if (success()) {
            <div class="auth-alert auth-alert--success" role="alert">{{ success() }}</div>
          }

          <button id="register-submit" type="submit" class="auth-btn" [disabled]="loading()">
            @if (loading()) { Creating account… } @else { Create Account }
          </button>
        </form>

        <p class="auth-footer-text">
          Already have an account?
          <a routerLink="/auth/login" class="auth-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { confirmPassword: _, ...payload } = this.form.getRawValue();
    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}

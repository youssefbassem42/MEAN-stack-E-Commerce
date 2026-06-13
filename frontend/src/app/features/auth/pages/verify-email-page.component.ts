import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="auth-logo-icon">EC</span>
          <span class="auth-logo-text">Commerce</span>
        </div>

        <h1 class="auth-title">Email Verification</h1>

        @if (loading()) {
          <div class="auth-verify-state">
            <div class="auth-spinner" aria-label="Verifying..."></div>
            <p class="auth-subtitle">Verifying your email…</p>
          </div>
        } @else if (success()) {
          <div class="auth-verify-state">
            <div class="auth-verify-icon auth-verify-icon--success" aria-hidden="true">✓</div>
            <p class="auth-subtitle">{{ success() }}</p>
            <a routerLink="/auth/login" id="verify-login-link" class="auth-btn" style="display:inline-block;text-align:center;margin-top:1rem;">
              Sign In
            </a>
          </div>
        } @else if (error()) {
          <div class="auth-verify-state">
            <div class="auth-verify-icon auth-verify-icon--error" aria-hidden="true">✕</div>
            <div class="auth-alert auth-alert--error" role="alert">{{ error() }}</div>
            <a routerLink="/auth/login" class="auth-link" style="display:block;text-align:center;margin-top:1rem;">
              ← Back to sign in
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class VerifyEmailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly success = signal('');
  readonly error = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      this.error.set('No verification token found in URL.');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Verification failed. The link may be expired or already used.');
      },
    });
  }
}

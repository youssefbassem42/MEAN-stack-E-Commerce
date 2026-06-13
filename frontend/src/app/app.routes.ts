import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent),
        title: 'Sign In — Commerce',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
        title: 'Create Account — Commerce',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password-page.component').then(
            (m) => m.ForgotPasswordPageComponent,
          ),
        title: 'Reset Password — Commerce',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/pages/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent,
          ),
        title: 'New Password — Commerce',
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/pages/verify-email-page.component').then(
            (m) => m.VerifyEmailPageComponent,
          ),
        title: 'Verify Email — Commerce',
      },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page.component').then(
            (module) => module.HomePageComponent,
          ),
        title: 'Home — Commerce',
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/pages/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
        title: 'My Profile — Commerce',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/products-page.component').then(
            (m) => m.ProductsPageComponent,
          ),
        title: 'Explore Catalog — Commerce',
      },
    ],
  },
];

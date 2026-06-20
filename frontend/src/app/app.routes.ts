import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent,
          ),
        title: 'Admin Panel — Commerce',
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
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cart/pages/cart-page.component').then(
            (m) => m.CartPageComponent,
          ),
        title: 'My Shopping Cart — Commerce',
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/wishlist/pages/wishlist-page.component').then(
            (m) => m.WishlistPageComponent,
          ),
        title: 'My Wishlist — Commerce',
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/checkout/pages/checkout-page.component').then(
            (m) => m.CheckoutPageComponent,
          ),
        title: 'Checkout — Commerce',
      },
      {
        path: 'checkout/success',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/checkout/pages/checkout-success-page.component'
          ).then((m) => m.CheckoutSuccessPageComponent),
        title: 'Order Success — Commerce',
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/pages/orders-page.component').then(
            (m) => m.OrdersPageComponent,
          ),
        title: 'My Orders — Commerce',
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/pages/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent,
          ),
        title: 'Order Details — Commerce',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/products-page.component').then(
            (m) => m.ProductsPageComponent,
          ),
        title: 'Explore Catalog — Commerce',
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/products/pages/product-detail-page.component').then(
            (m) => m.ProductDetailPageComponent,
          ),
        title: 'Product Details — Commerce',
      },
    ],
  },
];

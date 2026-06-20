import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentUser = auth.user();
  if (auth.isLoggedIn() && currentUser && currentUser.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/']);
};

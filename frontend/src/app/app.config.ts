import { ApplicationConfig, provideBrowserGlobalErrorListeners, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, authInterceptor])),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EGP' },
  ],
};

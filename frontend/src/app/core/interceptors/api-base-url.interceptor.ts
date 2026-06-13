import { HttpInterceptorFn } from '@angular/common/http';
import { apiConfig } from '../config/api.config';

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (isAbsoluteUrl(request.url)) {
    return next(request);
  }

  return next(
    request.clone({
      url: `${apiConfig.baseUrl}${request.url}`,
    }),
  );
};

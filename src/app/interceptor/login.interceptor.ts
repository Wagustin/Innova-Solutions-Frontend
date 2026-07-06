import {HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from "rxjs";

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      withCredentials: true,
      headers: req.headers.set('Authorization', "Bearer " + token)
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === HttpStatusCode.Unauthorized && !req.url.includes('/authenticate')) {
        localStorage.clear();
        router.navigate(['/login'], { queryParams: { expired: '1' } });
      }
      // If it's a 403 (Forbidden), we just pass the error along instead of forcing a logout.
      return throwError(() => error);
    })
  );
};

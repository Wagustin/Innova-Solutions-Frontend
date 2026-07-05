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
      if (error.status === HttpStatusCode.Forbidden && !req.url.includes('/authenticate')) {
        localStorage.clear();
        router.navigate(['/login'], { queryParams: { expired: '1' } });
      }
      return throwError(() => error);
    })
  );
};

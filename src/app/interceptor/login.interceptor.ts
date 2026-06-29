import {HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {catchError, throwError} from "rxjs";

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("Intercepto!!");
  const token = localStorage.getItem('token');
  console.log("Token recuperado:", token)
  let authReq = req;
  
  // Clona la solicitud y añade el encabezado de autorización
  if (token) {
    authReq = req.clone({
      withCredentials: true,
      headers: req.headers.set('Authorization', "Bearer " + token)
    });
    console.log("Se terminó de clonar la solicitud");
  }

  return next(authReq).pipe(
    catchError(error => {
      console.log("Error en la petición");
      if (error.status === HttpStatusCode.Forbidden && !req.url.includes('/authenticate')) {
        alert("NO TIENES PERMISOS!");
      }
      return throwError(() => error);
    })
  );
};

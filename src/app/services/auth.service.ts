import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/authenticate';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password }, { observe: 'response' }).pipe(
      map((response: any) => {
        const body = response.body;
        const headers = response.headers;
        const bearerToken = headers.get('Authorization');
        if (bearerToken) {
          const token = bearerToken.replace('Bearer ', '');
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          this.tryExtractAndSaveUserId(token, body);
        } else if (body && body.jwt) {
          localStorage.setItem('token', body.jwt);
          this.tryExtractAndSaveUserId(body.jwt, body);
        }
        if (body && body.rol) {
          localStorage.setItem('rol', this.limpiarRol(body.rol));
        } else if (body && body.rolNombre) {
          localStorage.setItem('rol', this.limpiarRol(body.rolNombre));
        } else if (body && body.role) {
          localStorage.setItem('rol', this.limpiarRol(body.role));
        } else if (body && body.roleName) {
          localStorage.setItem('rol', this.limpiarRol(body.roleName));
        } else if (body && body.tipo) {
          localStorage.setItem('rol', this.limpiarRol(body.tipo));
        } else if (body && body.roles && body.roles.length > 0) {
          localStorage.setItem('rol', this.limpiarRol(body.roles[0]));
        } else if (body && body.authorities && body.authorities.length > 0) {
          localStorage.setItem('rol', this.limpiarRol(body.authorities[0]));
        }
        return body;
      })
    );
  }

  private tryExtractAndSaveUserId(token: string, body: any) {
    if (body && body.id) {
      localStorage.setItem('userId', body.id);
    } else if (body && body.userId) {
      localStorage.setItem('userId', body.userId);
    } else {
      this.tryExtractFromJwt(token);
    }

    if (!localStorage.getItem('rol')) {
      this.tryExtractRolFromJwt(token);
    }
  }

  private tryExtractFromJwt(token: string): void {
    try {
      const payload = this.decodeJwt(token);
      if (!payload) return;
      if (payload.id) localStorage.setItem('userId', payload.id);
      else if (payload.userId) localStorage.setItem('userId', payload.userId);
    } catch (e) {
      console.error('Error al decodificar token JWT', e);
    }
  }

  private tryExtractRolFromJwt(token: string): void {
    try {
      const payload = this.decodeJwt(token);
      if (!payload) return;
      const raw = payload.rol || payload.role || payload.rolNombre || payload.roleName
               || payload.tipo || payload.rolId
               || this.arrayFirst(payload.roles)
               || this.arrayFirst(payload.authorities)
               || this.arrayFirst(payload.groups);
      if (raw) {
        localStorage.setItem('rol', this.limpiarRol(raw));
      }
    } catch (e) {
      console.error('Error al extraer rol del token JWT', e);
    }
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private arrayFirst(arr: any): string | null {
    return Array.isArray(arr) && arr.length > 0 ? String(arr[0]) : null;
  }

  private limpiarRol(rol: any): string {
    const s = String(rol).toUpperCase().trim();
    return s.replace(/^ROLE_/, '');
  }
}

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
          // Fallback en caso el backend aún envíe jwt en el body
          localStorage.setItem('token', body.jwt);
          this.tryExtractAndSaveUserId(body.jwt, body);
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
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          if (payload.id) localStorage.setItem('userId', payload.id);
          else if (payload.userId) localStorage.setItem('userId', payload.userId);
          else if (payload.custom_id) localStorage.setItem('userId', payload.custom_id);
        }
      } catch (e) {
        console.error('Error al decodificar token JWT', e);
      }
    }
  }
}

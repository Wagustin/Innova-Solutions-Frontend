import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiDataService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Usuarios (Registro)
  registrarUsuario(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, payload, { headers: this.getHeaders() });
  }

  // Categorías
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categorias`, { headers: this.getHeaders() });
  }
  crearCategoria(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categorias`, payload, { headers: this.getHeaders() });
  }

  // Temas
  getTemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/temas`, { headers: this.getHeaders() });
  }
  crearTema(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/temas`, payload, { headers: this.getHeaders() });
  }

  // Lecciones
  getLecciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lecciones-custom`, { headers: this.getHeaders() });
  }
  crearLeccion(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lecciones-custom`, payload, { headers: this.getHeaders() });
  }

  // Flashcards
  getFlashcards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/flashcards`, { headers: this.getHeaders() });
  }
  crearFlashcardConOpciones(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flashcards/con-opciones`, payload, { headers: this.getHeaders() });
  }
}

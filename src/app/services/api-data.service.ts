import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiDataService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Usuarios (Registro)
  registrarUsuario(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, payload);
  }

  // Categorías
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categorias`);
  }
  crearCategoria(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categorias`, payload);
  }

  // Temas
  getTemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/temas`);
  }
  crearTema(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/temas`, payload);
  }

  // Lecciones
  getLecciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lecciones-custom`);
  }
  crearLeccion(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lecciones-custom`, payload);
  }

  // Flashcards
  getFlashcards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/flashcards`);
  }
  crearFlashcardConOpciones(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flashcards/con-opciones`, payload);
  }
  // Usuarios (Perfil)
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${id}`);
  }

  actualizarUsuario(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}`, payload);
  }
}

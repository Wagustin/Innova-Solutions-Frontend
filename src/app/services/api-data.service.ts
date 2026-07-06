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
  getFlashcard(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/flashcards/${id}`);
  }
  crearFlashcardConOpciones(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flashcards/con-opciones`, payload);
  }

  getReporteDificultad(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/flashcards/reporte/dificultad`);
  }

  actualizarFlashcard(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/flashcards/${id}`, payload);
  }
  eliminarFlashcard(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/flashcards/${id}`);
  }
  // Upload
  subirImagen(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, fd);
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

  // Alumnos (registro desde Padre)
  registrarAlumno(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/registro-alumno`, payload);
  }
  // Progresos de Evaluación
  getProgresosEvaluacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/progresos-evaluacion`);
  }
  crearProgresoEvaluacion(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/progresos-evaluacion`, payload);
  }

  // Relaciones Tutor-Estudiante
  getRelacionesTutorEstudiante(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/relaciones-tutor-estudiante`);
  }
}

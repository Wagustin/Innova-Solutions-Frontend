import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-creacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './creacion.html',
  styleUrls: ['./creacion.css']
})
export class Creacion implements OnInit {
  catForm!: FormGroup;
  temaForm!: FormGroup;
  leccionForm!: FormGroup;
  flashcardForm!: FormGroup;

  categorias: any[] = [];
  temas: any[] = [];
  lecciones: any[] = [];
  flashcards: any[] = [];

  constructor(private fb: FormBuilder, private api: ApiDataService) {}

  ngOnInit() {
    this.catForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      iconoUrl: ['https://ejemplo.com/icono.png'] // Default url para testing
    });

    this.temaForm = this.fb.group({
      categoriaId: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.leccionForm = this.fb.group({
      temaId: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.flashcardForm = this.fb.group({
      leccionId: ['', Validators.required],
      preguntaTexto: ['', Validators.required],
      colorFondo: ['#fdf7c3', Validators.required],
      colorTexto: ['#2c3e50', Validators.required],
      imagenUrl: ['https://ejemplo.com/img.png'], // default para testing
      resp1: ['', Validators.required],
      resp1Correcta: [false],
      resp1Feedback: ['Buen intento', Validators.required],
      resp2: ['', Validators.required],
      resp2Correcta: [false],
      resp2Feedback: ['Correcto', Validators.required]
    });

    this.loadData();
  }

  loadData() {
    this.api.getCategorias().subscribe(res => this.categorias = res);
    this.api.getTemas().subscribe(res => this.temas = res);
    this.api.getLecciones().subscribe(res => this.lecciones = res);
    this.api.getFlashcards().subscribe(res => this.flashcards = res);
  }

  saveCat() {
    if(this.catForm.valid) {
      this.api.crearCategoria(this.catForm.value).subscribe({
        next: (res) => { this.loadData(); this.catForm.reset({iconoUrl: 'https://ejemplo.com/icono.png'}); },
        error: (err) => console.error(err)
      });
    }
  }

  saveTema() {
    if(this.temaForm.valid) {
      this.api.crearTema(this.temaForm.value).subscribe({
        next: (res) => { this.loadData(); this.temaForm.reset(); },
        error: (err) => console.error(err)
      });
    }
  }

  saveLeccion() {
    if(this.leccionForm.valid) {
      const payload = {
        ...this.leccionForm.value,
        dificultad: 'Fácil',
        creadorId: 1, // Mock user ID (puede venir del jwt)
        estudianteId: 1 // Mock estudiante ID
      };
      this.api.crearLeccion(payload).subscribe({
        next: (res) => { this.loadData(); this.leccionForm.reset(); },
        error: (err) => console.error(err)
      });
    }
  }

  saveFlashcard() {
    if(this.flashcardForm.valid) {
      const form = this.flashcardForm.value;
      const payload = {
        preguntaTexto: form.preguntaTexto,
        imagenUrl: form.imagenUrl,
        colorFondo: form.colorFondo,
        colorTexto: form.colorTexto,
        leccionId: form.leccionId,
        opciones: [
          { textoOpcion: form.resp1, esCorrecta: form.resp1Correcta, feedbackRespuesta: form.resp1Feedback },
          { textoOpcion: form.resp2, esCorrecta: form.resp2Correcta, feedbackRespuesta: form.resp2Feedback }
        ]
      };
      
      this.api.crearFlashcardConOpciones(payload).subscribe({
        next: (res) => { this.loadData(); this.flashcardForm.reset({colorFondo: '#fdf7c3', colorTexto: '#2c3e50', imagenUrl: 'https://ejemplo.com/img.png'}); },
        error: (err) => console.error(err)
      });
    }
  }

  getCatName(id: number) {
    return this.categorias.find(c => c.id === id)?.nombre || id;
  }
  
  getTemaName(id: number) {
    return this.temas.find(t => t.id === id)?.nombre || id;
  }
  
  getLeccionName(id: number) {
    return this.lecciones.find(l => l.id === id)?.titulo || id;
  }
}

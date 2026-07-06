import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  alumnos: any[] = [];

  imagenUrl = '';
  imagenPreview = '';
  imagenSubiendo = false;
  archivoSeleccionado: File | null = null;
  editId: number | null = null;
  modalAbierto: 'cat' | 'tema' | 'leccion' | 'flashcard' | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      estudianteId: ['', Validators.required]
    });

    this.flashcardForm = this.fb.group({
      leccionId: ['', Validators.required],
      preguntaTexto: ['', Validators.required],
      resp1: ['', Validators.required],
      resp1Correcta: [false],
      resp1Feedback: [''],
      resp2: ['', Validators.required],
      resp2Correcta: [false],
      resp2Feedback: ['']
    });

    this.loadData();

    const editParam = this.route.snapshot.queryParamMap.get('edit');
    if (editParam) {
      this.editId = Number(editParam);
      this.api.getFlashcard(this.editId).subscribe({
        next: (f) => {
          this.flashcardForm.patchValue({
            leccionId: f.leccion?.id ?? f.leccionId,
            preguntaTexto: f.preguntaTexto,
          });
          if (f.opciones?.length > 0) {
            this.flashcardForm.patchValue({
              resp1: f.opciones[0].textoOpcion,
              resp1Correcta: f.opciones[0].esCorrecta,
              resp1Feedback: f.opciones[0].feedbackRespuesta,
            });
          }
          if (f.opciones?.length > 1) {
            this.flashcardForm.patchValue({
              resp2: f.opciones[1].textoOpcion,
              resp2Correcta: f.opciones[1].esCorrecta,
              resp2Feedback: f.opciones[1].feedbackRespuesta,
            });
          }
          this.imagenUrl = f.imagenUrl || '';
        }
      });
    }
  }

  loadData() {
    this.api.getCategorias().subscribe(res => this.categorias = res);
    this.api.getTemas().subscribe(res => this.temas = res);
    this.api.getLecciones().subscribe(res => this.lecciones = res);
    this.api.getFlashcards().subscribe(res => this.flashcards = res);
    this.api.getUsuarios().subscribe(res => {
      this.alumnos = res.filter((u: any) => u.rol?.id === 3);
    });
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
      const userId = localStorage.getItem('userId');
      const payload = {
        ...this.leccionForm.value,
        dificultad: 'Fácil',
        creadorId: userId ? Number(userId) : 1
      };
      this.api.crearLeccion(payload).subscribe({
        next: (res) => { this.loadData(); this.leccionForm.reset(); },
        error: (err) => console.error(err)
      });
    }
  }

  onUrlPasted(event: any) {
    const url = event.target.value?.trim();
    this.imagenUrl = url || '';
    if (url) { this.imagenPreview = ''; this.archivoSeleccionado = null; }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.archivoSeleccionado = file;
    // preview local
    const reader = new FileReader();
    reader.onload = e => this.imagenPreview = e.target?.result as string;
    reader.readAsDataURL(file);
    // subir al server
    this.imagenSubiendo = true;
    this.api.subirImagen(file).subscribe({
      next: (res) => { this.imagenUrl = 'http://localhost:8080' + res.url; this.imagenSubiendo = false; },
      error: () => { this.imagenSubiendo = false; alert('Error al subir la imagen'); }
    });
  }

  saveFlashcard() {
    if(this.flashcardForm.valid) {
      const form = this.flashcardForm.value;
      const payload: any = {
        preguntaTexto: form.preguntaTexto,
        imagenUrl: this.imagenUrl,
        colorFondo: '#fdf7c3',
        colorTexto: '#2c3e50',
        leccionId: form.leccionId,
        opciones: [
          { textoOpcion: form.resp1, esCorrecta: form.resp1Correcta, feedbackRespuesta: form.resp1Feedback || 'Sin feedback' },
          { textoOpcion: form.resp2, esCorrecta: form.resp2Correcta, feedbackRespuesta: form.resp2Feedback || 'Sin feedback' }
        ]
      };

      if (this.editId) {
        this.api.actualizarFlashcard(this.editId, {
          preguntaTexto: form.preguntaTexto,
          imagenUrl: this.imagenUrl,
          colorFondo: '#fdf7c3',
          colorTexto: '#2c3e50',
          leccionId: form.leccionId
        }).subscribe({
          next: () => { this.loadData(); this.flashcardForm.reset(); this.imagenUrl = ''; this.editId = null; },
          error: (err) => console.error(err)
        });
      } else {
        this.api.crearFlashcardConOpciones(payload).subscribe({
          next: () => { this.loadData(); this.flashcardForm.reset(); this.imagenUrl = ''; this.imagenPreview = ''; this.archivoSeleccionado = null; },
          error: (err) => console.error(err)
        });
      }
    }
  }

  abrirModal(tipo: 'cat' | 'tema' | 'leccion' | 'flashcard'): void {
    this.modalAbierto = tipo;
    if (tipo === 'cat') this.catForm.reset({iconoUrl: 'https://ejemplo.com/icono.png'});
    else if (tipo === 'tema') this.temaForm.reset();
    else if (tipo === 'leccion') this.leccionForm.reset();
    else if (tipo === 'flashcard') { this.flashcardForm.reset(); this.imagenUrl = ''; this.imagenPreview = ''; }
  }

  cerrarModal(): void {
    this.modalAbierto = null;
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

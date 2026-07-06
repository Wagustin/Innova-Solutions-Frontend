import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';

@Component({
  selector: 'app-responder-flashcard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responder-container" *ngIf="flashcard">
      <div style="display:flex; gap:10px; margin-bottom:20px; align-items:center;">
        <button class="btn btn-black" (click)="router.navigate(['/mis-flashcards'])">← Volver</button>
        <button class="btn btn-black" style="background:#e67e22" (click)="editar()" *ngIf="rol === 'PROFESOR'">✏️ Editar</button>
        <button class="btn btn-black" style="background:#c0392b" (click)="eliminar()" *ngIf="rol === 'PROFESOR'">🗑️ Borrar</button>
      </div>

      <div class="flashcard-card" [style.backgroundColor]="flashcard.colorFondo || '#fdf7c3'">
        <p class="pregunta" [style.color]="flashcard.colorTexto || '#2c3e50'">{{ flashcard.preguntaTexto }}</p>
        <img *ngIf="flashcard.imagenUrl" [src]="flashcard.imagenUrl" class="resp-img">
      </div>

      <div class="opciones" *ngIf="!respuestaVisible">
        <button *ngFor="let op of flashcard.opciones" class="opcion-btn"
          [class.correcta]="respondida && op.esCorrecta"
          [class.incorrecta]="respondida && op === seleccionada && !op.esCorrecta"
          (click)="responder(op)" [disabled]="respondida">
          {{ op.textoOpcion }}
        </button>
      </div>

      <div *ngIf="respondida && feedback" class="feedback-box">{{ feedback }}</div>

      <button class="btn btn-black" style="margin-top:20px; width:100%" *ngIf="!respuestaVisible" (click)="mostrarRespuesta()">Ver respuesta</button>

      <div *ngIf="respuestaVisible" class="respuesta-box">
        ✅ {{ flashcard.respuestaCorrecta }}
      </div>

      <div *ngIf="respondida" style="display:flex; gap:10px; margin-top:16px;">
        <button class="btn btn-black" style="flex:1" (click)="repetir()">🔄 Repetir</button>
        <button class="btn btn-black" style="flex:1" (click)="router.navigate(['/mis-flashcards'])">Volver</button>
      </div>
    </div>

    <div *ngIf="!flashcard && !error" class="state-msg">Cargando...</div>
    <div *ngIf="error" class="state-msg error">{{ error }}</div>
  `,
  styles: [`
    .responder-container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .flashcard-card { padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 30px; }
    .pregunta { font-size: 1.5rem; font-weight: 900; margin: 0; }
    .resp-img { max-width: 100%; max-height: 200px; margin-top: 20px; border-radius: 12px; }
    .opciones { display: flex; flex-direction: column; gap: 12px; }
    .opcion-btn { padding: 16px; border-radius: 12px; border: 2px solid #ddd; background: white; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .opcion-btn:hover:not(:disabled) { border-color: #333; }
    .opcion-btn.correcta { border-color: #27ae60; background: #d5f5e3; color: #1e8449; }
    .opcion-btn.incorrecta { border-color: #e74c3c; background: #fadbd8; color: #c0392b; }
    .feedback-box { margin-top: 20px; padding: 15px; border-radius: 12px; background: #f0f4ff; font-weight: 700; text-align: center; }
    .respuesta-box { margin-top: 20px; padding: 24px; border-radius: 16px; background: #d5f5e3; text-align: center; font-size: 1.3rem; font-weight: 900; color: #1e8449; }
    .state-msg { text-align: center; padding: 60px; font-size: 1.1rem; font-weight: 600; color: #666; }
    .state-msg.error { color: #c0392b; }
  `]
})
export class ResponderFlashcard implements OnInit {
  flashcard: any = null;
  respondida = false;
  seleccionada: any = null;
  feedback = '';
  error = '';
  respuestaVisible = false;
  progresoGuardado = false;
  rol = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiDataService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit() {
    this.rol = (localStorage.getItem('rol') || '').toUpperCase().replace(/^ROLE_/, '');
    const id = this.route.snapshot.params['id'];
    if (!id) { this.error = 'Flashcard no encontrada.'; return; }
    this.api.getFlashcard(id).subscribe({
      next: (f) => { this.flashcard = f; this.cdr.detectChanges(); },
      error: () => { this.error = 'No se pudo cargar la flashcard.'; this.cdr.detectChanges(); }
    });
  }

  private guardarProgreso(): void {
    if (this.progresoGuardado) return;
    const userId = localStorage.getItem('userId');
    const rol = (localStorage.getItem('rol') || '').toUpperCase();
    if (!userId || rol !== 'ALUMNO') return;
    const leccionId = this.flashcard.leccion?.id;
    if (!leccionId) return;
    this.progresoGuardado = true;
    this.api.crearProgresoEvaluacion({
      puntaje: 10,
      medallasObtenidas: 1,
      fechaEvaluacion: new Date().toISOString(),
      reporteGenerado: 'Completado desde el visor de flashcards',
      estudianteId: Number(userId),
      leccionId: leccionId
    }).subscribe({ error: () => { this.progresoGuardado = false; } });
  }

  responder(op: any) {
    this.respondida = true;
    this.seleccionada = op;
    const correcta = this.flashcard.opciones?.find((o: any) => o.esCorrecta);
    this.feedback = op.esCorrecta
      ? '✅ ¡Correcto!'
      : `❌ Incorrecto. La respuesta correcta era: ${correcta?.textoOpcion || '?'}`;
    if (op.esCorrecta) this.guardarProgreso();
    this.cdr.detectChanges();
  }

  mostrarRespuesta() {
    this.respuestaVisible = true;
    this.guardarProgreso();
    this.cdr.detectChanges();
  }

  editar() {
    this.router.navigate(['/creacion'], { queryParams: { edit: this.flashcard.id } });
  }

  repetir() {
    this.respondida = false;
    this.seleccionada = null;
    this.feedback = '';
    this.respuestaVisible = false;
    this.progresoGuardado = false;
    this.cdr.detectChanges();
  }

  eliminar() {
    if (!confirm('¿Eliminar esta flashcard?')) return;
    this.api.eliminarFlashcard(this.flashcard.id).subscribe({
      next: () => this.router.navigate(['/mis-flashcards']),
      error: () => alert('Error al eliminar la flashcard')
    });
  }
}

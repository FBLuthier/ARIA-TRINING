import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EjercicioRutina, SerieEjercicio } from '../models/rutina.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ejercicio-rutina',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ejercicio-rutina.component.html',
  styleUrls: ['./ejercicio-rutina.component.css']
})
export class EjercicioRutinaComponent implements OnInit {
  @Input() ejercicio!: EjercicioRutina;
  @Input() modoEdicion: boolean = true;
  @Input() modoSeguimiento: boolean = false;
  
  @Output() guardar = new EventEmitter<EjercicioRutina>();
  @Output() cancelar = new EventEmitter<void>();
  
  videoUrlSanitized: SafeResourceUrl | null = null;
  
  // Opciones para el tempo
  tiposTempo = [
    { valor: 'subida-pausa-bajada', texto: 'Subida - Pausa - Bajada' },
    { valor: 'bajada-pausa-subida', texto: 'Bajada - Pausa - Subida' }
  ];
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {
    this.inicializarEjercicio();
    this.sanitizarVideoUrl();
  }
  
  /**
   * Inicializa el ejercicio con valores por defecto si es necesario
   */
  inicializarEjercicio(): void {
    if (!this.ejercicio) {
      this.ejercicio = {
        id: 0,
        faseRutinaId: 0,
        ejercicioId: 0,
        nombre: '',
        numSeries: 3,
        numRepeticiones: 10,
        tempo: {
          tipo: 'subida-pausa-bajada',
          tiempos: [2, 1, 2]
        },
        descanso: {
          minutos: 1,
          segundos: 0
        },
        camara: '',
        indicaciones: '',
        series: [],
        correcciones: '',
        comentarios: '',
        videoUrl: '',
        videoEjecucionUrl: '',
        orden: 0
      };
    }
    
    // Inicializar series si no existen
    if (!this.ejercicio.series || this.ejercicio.series.length === 0) {
      this.inicializarSeries();
    }
  }
  
  /**
   * Inicializa las series del ejercicio
   */
  inicializarSeries(): void {
    this.ejercicio.series = [];
    for (let i = 0; i < this.ejercicio.numSeries; i++) {
      this.ejercicio.series.push({
        id: 0,
        ejercicioRutinaId: this.ejercicio.id,
        numero: i + 1,
        pesoObjetivo: 0,
        pesoRealizado: 0,
        repeticionesRealizadas: 0,
        completada: false
      });
    }
  }
  
  /**
   * Actualiza el número de series y ajusta el array de series
   */
  actualizarNumeroSeries(): void {
    const seriesActuales = this.ejercicio.series.length;
    const seriesNuevas = this.ejercicio.numSeries;
    
    if (seriesNuevas > seriesActuales) {
      // Agregar series
      for (let i = seriesActuales; i < seriesNuevas; i++) {
        this.ejercicio.series.push({
          id: 0,
          ejercicioRutinaId: this.ejercicio.id,
          numero: i + 1,
          pesoObjetivo: 0,
          pesoRealizado: 0,
          repeticionesRealizadas: 0,
          completada: false
        });
      }
    } else if (seriesNuevas < seriesActuales) {
      // Eliminar series
      this.ejercicio.series = this.ejercicio.series.slice(0, seriesNuevas);
    }
  }
  
  /**
   * Sanitiza la URL del video para que sea segura
   */
  sanitizarVideoUrl(): void {
    if (this.ejercicio?.videoUrl) {
      this.videoUrlSanitized = this.sanitizer.bypassSecurityTrustResourceUrl(this.ejercicio.videoUrl);
    }
  }
  
  /**
   * Actualiza la URL del video y la sanitiza
   */
  actualizarVideoUrl(): void {
    this.sanitizarVideoUrl();
  }
  
  /**
   * Guarda los cambios del ejercicio
   */
  guardarEjercicio(): void {
    this.guardar.emit(this.ejercicio);
  }
  
  /**
   * Cancela la edición del ejercicio
   */
  cancelarEdicion(): void {
    this.cancelar.emit();
  }
  
  /**
   * Formatea el tiempo de descanso para mostrar
   */
  formatearDescanso(): string {
    if (!this.ejercicio?.descanso) return '0:00';
    const minutos = this.ejercicio.descanso.minutos || 0;
    const segundos = this.ejercicio.descanso.segundos || 0;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }
}

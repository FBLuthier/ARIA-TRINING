import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Rutina, DiaRutina, FaseRutina, EjercicioRutina } from '../models/rutina.model';
import { RutinaService } from '../services/rutina.service';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-ver-rutina',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  templateUrl: './ver-rutina.component.html',
  styleUrls: ['./ver-rutina.component.css']
})
export class VerRutinaComponent implements OnInit {
  @Input() rutinaId!: number;
  @Input() usuarioId!: number;
  @Input() modoEdicion: boolean = false;
  
  @Output() editar = new EventEmitter<Rutina>();
  @Output() cerrar = new EventEmitter<void>();
  
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  rutina: Rutina | null = null;
  diaSeleccionado: DiaRutina | null = null;
  faseSeleccionada: FaseRutina | null = null;
  ejercicioSeleccionado: EjercicioRutina | null = null;
  faseDelEjercicioSeleccionado: FaseRutina | null = null;
  
  cargando: boolean = false;
  error: string = '';
  
  constructor(private rutinaService: RutinaService) {}
  
  ngOnInit(): void {
    this.cargarRutina();
  }
  
  /**
   * Carga los datos de la rutina
   */
  cargarRutina(): void {
    if (!this.rutinaId) return;
    
    this.cargando = true;
    this.error = '';
    
    this.rutinaService.obtenerRutina(this.rutinaId).subscribe({
      next: (rutina) => {
        if (rutina) {
          this.rutina = rutina;
          // Seleccionar el primer día por defecto si hay días disponibles
          if (rutina.dias.length > 0) {
            this.seleccionarDia(rutina.dias[0]);
          }
        } else {
          this.error = 'No se encontró la rutina solicitada.';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la rutina: ' + (err.message || 'Error desconocido');
        this.cargando = false;
      }
    });
  }
  
  /**
   * Selecciona un día de la rutina
   */
  seleccionarDia(dia: DiaRutina): void {
    this.diaSeleccionado = dia;
    // No seleccionar automáticamente la primera fase para mantener todo colapsado por defecto
    this.faseSeleccionada = null;
    this.ejercicioSeleccionado = null;
    this.faseDelEjercicioSeleccionado = null;
  }
  
  /**
   * Verifica si una fase está expandida
   */
  esFaseExpandida(fase: FaseRutina): boolean {
    return this.faseSeleccionada === fase;
  }

  /**
   * Verifica si un ejercicio está seleccionado
   */
  esEjercicioSeleccionado(ejercicio: EjercicioRutina): boolean {
    return this.ejercicioSeleccionado?.id === ejercicio.id;
  }

  /**
   * Verifica si el ejercicio seleccionado pertenece a una fase específica
   */
  esEjercicioSeleccionadoDeFase(fase: FaseRutina): boolean {
    return this.ejercicioSeleccionado !== null && this.faseDelEjercicioSeleccionado === fase;
  }

  /**
   * Alterna la selección de una fase (toggle)
   */
  toggleFase(fase: FaseRutina): void {
    if (this.faseSeleccionada === fase) {
      // Si la fase ya está seleccionada, la deseleccionamos
      this.faseSeleccionada = null;
    } else {
      // Si no está seleccionada, la seleccionamos
      this.faseSeleccionada = fase;
    }
    // Al cambiar de fase, cerramos el detalle del ejercicio
    if (this.faseDelEjercicioSeleccionado !== fase) {
      this.ejercicioSeleccionado = null;
      this.faseDelEjercicioSeleccionado = null;
    }
  }
  
  /**
   * Selecciona un ejercicio de la fase y muestra su detalle
   */
  seleccionarEjercicio(ejercicio: EjercicioRutina, fase: FaseRutina): void {
    this.ejercicioSeleccionado = ejercicio;
    this.faseDelEjercicioSeleccionado = fase;
    
    // Aseguramos que la fase esté expandida
    this.faseSeleccionada = fase;
    
    // Desplazamos la vista al detalle del ejercicio
    setTimeout(() => {
      const detalleElement = document.querySelector('.card.mt-4');
      if (detalleElement) {
        detalleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Cierra el detalle del ejercicio seleccionado
   */
  cerrarDetalleEjercicio(): void {
    this.ejercicioSeleccionado = null;
    this.faseDelEjercicioSeleccionado = null;
  }
  
  /**
   * Edita la rutina actual
   */
  editarRutina(): void {
    if (this.rutina) {
      this.editar.emit(this.rutina);
    }
  }
  
  /**
   * Archiva la rutina actual
   */
  archivarRutina(): void {
    if (!this.rutina) return;
    
    this.cargando = true;
    this.error = '';
    
    this.rutinaService.archivarRutinaById(this.rutina.id).subscribe({
      next: (exito) => {
        if (exito) {
          if (this.rutina) {
            this.rutina.activa = false;
          }
        } else {
          this.error = 'No se pudo archivar la rutina.';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al archivar la rutina: ' + (err.message || 'Error desconocido');
        this.cargando = false;
      }
    });
  }
  
  /**
   * Cierra el modal o componente
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }
  
  /**
   * Reproduce el video del ejercicio seleccionado
   */
  reproducirVideo(): void {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.play();
    }
  }
  
  /**
   * Pausa el video del ejercicio seleccionado
   */
  pausarVideo(): void {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.pause();
    }
  }
  
  /**
   * Detiene el video del ejercicio seleccionado
   */
  detenerVideo(): void {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.pause();
      this.videoPlayer.nativeElement.currentTime = 0;
    }
  }
  
  /**
   * Formatea el tiempo de descanso para mostrar
   */
  formatearDescanso(descanso: { minutos: number, segundos: number } | undefined): string {
    if (!descanso) return '0:00';
    const minutos = descanso.minutos || 0;
    const segundos = descanso.segundos || 0;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }
  
  /**
   * Formatea el tempo para mostrar
   */
  formatearTempo(tempo: { tipo: string, tiempos: [number, number, number] } | undefined): string {
    if (!tempo || !tempo.tiempos) return '';
    return tempo.tiempos.join('-');
  }
}

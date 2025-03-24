import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialRutina } from '../models/rutina.model';
import { RutinaService } from '../services/rutina.service';

@Component({
  selector: 'app-historial-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-rutinas.component.html',
  styleUrls: ['./historial-rutinas.component.css']
})
export class HistorialRutinasComponent implements OnInit {
  @Input() usuarioId!: number;
  @Input() nombreUsuario: string = '';
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() verRutina = new EventEmitter<HistorialRutina>();
  
  historialRutinas: HistorialRutina[] = [];
  rutinaSeleccionada: HistorialRutina | null = null;
  cargando: boolean = false;
  error: string | null = null;
  
  // Filtros
  filtroAno: number = new Date().getFullYear();
  anos: number[] = [];
  
  constructor(private rutinaService: RutinaService) {}
  
  ngOnInit(): void {
    this.cargarHistorial();
    this.inicializarFiltros();
  }
  
  /**
   * Carga el historial de rutinas del usuario
   */
  cargarHistorial(): void {
    this.cargando = true;
    this.error = null;
    
    this.rutinaService.obtenerHistorialRutinas(this.usuarioId).subscribe({
      next: (historial) => {
        this.historialRutinas = historial;
        this.cargando = false;
        
        // Actualizar los años disponibles para filtrar
        this.actualizarAnosDisponibles();
      },
      error: (err) => {
        console.error('Error al cargar el historial de rutinas', err);
        this.error = 'No se pudo cargar el historial de rutinas. Por favor, inténtelo de nuevo.';
        this.cargando = false;
      }
    });
  }
  
  /**
   * Inicializa los filtros disponibles
   */
  inicializarFiltros(): void {
    const anoActual = new Date().getFullYear();
    this.filtroAno = anoActual;
    this.anos = [anoActual - 1, anoActual, anoActual + 1];
  }
  
  /**
   * Actualiza los años disponibles para filtrar basado en el historial
   */
  actualizarAnosDisponibles(): void {
    if (this.historialRutinas.length === 0) return;
    
    const anosUnicos = [...new Set(this.historialRutinas.map(h => h.año))];
    anosUnicos.sort((a, b) => b - a); // Ordenar de más reciente a más antiguo
    
    this.anos = anosUnicos;
    
    // Si el año actual de filtro no está en la lista, usar el más reciente
    if (!this.anos.includes(this.filtroAno) && this.anos.length > 0) {
      this.filtroAno = this.anos[0];
    }
  }
  
  /**
   * Filtra el historial por año
   */
  filtrarPorAno(ano: number): void {
    this.filtroAno = ano;
  }
  
  /**
   * Obtiene el historial filtrado por año
   */
  get historialFiltrado(): HistorialRutina[] {
    return this.historialRutinas
      .filter(h => h.año === this.filtroAno)
      .sort((a, b) => b.semana - a.semana); // Ordenar por semana descendente
  }
  
  /**
   * Selecciona una rutina para ver detalles
   */
  seleccionarRutina(rutina: HistorialRutina): void {
    this.rutinaSeleccionada = rutina;
  }
  
  /**
   * Emite evento para ver la rutina completa
   */
  verRutinaCompleta(rutina: HistorialRutina): void {
    this.verRutina.emit(rutina);
  }
  
  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }
  
  /**
   * Formatea la fecha para mostrar
   */
  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}

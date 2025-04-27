import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import { HttpErrorResponse } from '@angular/common/http';

// Definir interfaces para mejorar el tipado
interface Deporte {
  id?: number;
  nombre: string;
  descripcion?: string;
}

// Enum para los tipos de modal
enum TipoModal {
  CREAR = 'modalCrearDeporte',
  EDITAR = 'modalEditarDeporte',
  DETALLES = 'modalDetallesDeporte',
  CONFIRMAR_ELIMINAR = 'modalConfirmarEliminar'
}

// Declaración de Bootstrap para TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit {
  deportes: Deporte[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Para el formulario de creación/edición
  deporteActual: Deporte = this.inicializarDeporteVacio();
  
  // Para la búsqueda y filtrado
  terminoBusqueda = '';
  deportesFiltrados: Deporte[] = [];
  
  constructor(private databaseService: DatabaseService) { }

  ngOnInit(): void {
    this.inicializarDeportes();
  }

  /**
   * Crea un objeto deporte vacío para el formulario
   */
  private inicializarDeporteVacio(): Deporte {
    return {
      id: undefined,
      nombre: '',
      descripcion: ''
    };
  }

  /**
   * Inicializa los deportes si la tabla está vacía
   */
  inicializarDeportes(): void {
    this.isLoading = true;
    
    this.databaseService.inicializarDeportes().subscribe({
      next: () => this.cargarDeportes(),
      error: (error) => {
        console.error('Error al inicializar deportes:', error);
        this.cargarDeportes();
      }
    });
  }
  
  /**
   * Carga los deportes desde la base de datos
   */
  cargarDeportes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.databaseService.getDeportes().subscribe({
      next: (response: any) => {
        this.procesarRespuestaDeportes(response);
      },
      error: (error: HttpErrorResponse) => {
        this.manejarError(error, 'cargar');
      }
    });
  }
  
  /**
   * Procesa la respuesta del servidor para los deportes
   */
  private procesarRespuestaDeportes(response: any): void {
    if (response && response.data) {
      this.deportes = response.data;
    } else if (Array.isArray(response)) {
      this.deportes = response;
    } else {
      this.deportes = [];
      console.warn('Formato de respuesta inesperado:', response);
    }
    
    this.deportesFiltrados = [...this.deportes];
    this.isLoading = false;
  }
  
  /**
   * Maneja los errores de las operaciones de la API
   */
  private manejarError(error: HttpErrorResponse, operacion: string): void {
    console.error(`Error al ${operacion} deportes:`, error);
    
    if (error.status === 0) {
      this.errorMessage = 'No se pudo conectar con el servidor. Verifique que el servidor esté en ejecución.';
    } else if (error.error && error.error.error) {
      this.errorMessage = error.error.error;
    } else {
      this.errorMessage = `Error al ${operacion} los deportes. Por favor, inténtelo de nuevo.`;
    }
    
    this.isLoading = false;
  }
  
  /**
   * Filtra los deportes según el término de búsqueda
   */
  buscarDeportes(): void {
    if (!this.terminoBusqueda.trim()) {
      this.deportesFiltrados = [...this.deportes];
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.deportesFiltrados = this.deportes.filter(deporte => 
      deporte.nombre.toLowerCase().includes(termino) || 
      (deporte.descripcion && deporte.descripcion.toLowerCase().includes(termino))
    );
  }
  
  /**
   * Abre el modal para crear un deporte
   */
  abrirModalCrearDeporte(): void {
    this.deporteActual = this.inicializarDeporteVacio();
    this.abrirModal(TipoModal.CREAR);
  }
  
  /**
   * Abre el modal para editar un deporte
   */
  abrirModalEditarDeporte(deporte: Deporte): void {
    this.deporteActual = { ...deporte };
    this.abrirModal(TipoModal.EDITAR);
  }
  
  /**
   * Abre el modal para ver detalles de un deporte
   */
  verDetallesDeporte(deporte: Deporte): void {
    this.deporteActual = { ...deporte };
    this.abrirModal(TipoModal.DETALLES);
  }
  
  /**
   * Abre el modal para confirmar eliminación
   */
  confirmarEliminarDeporte(deporte: Deporte): void {
    this.deporteActual = { ...deporte };
    this.abrirModal(TipoModal.CONFIRMAR_ELIMINAR);
  }
  
  /**
   * Abre un modal usando Bootstrap
   */
  private abrirModal(tipoModal: TipoModal): void {
    const modalElement = document.getElementById(tipoModal);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  /**
   * Cierra un modal usando Bootstrap
   */
  private cerrarModal(tipoModal: TipoModal): void {
    const modalElement = document.getElementById(tipoModal);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  
  /**
   * Elimina un deporte
   */
  eliminarDeporte(): void {
    if (!this.deporteActual.id) {
      this.errorMessage = 'ID de deporte no válido';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.databaseService.eliminarDeporte(this.deporteActual.id).subscribe({
      next: () => {
        this.cerrarModal(TipoModal.CONFIRMAR_ELIMINAR);
        this.cargarDeportes();
      },
      error: (error: HttpErrorResponse) => {
        this.cerrarModal(TipoModal.CONFIRMAR_ELIMINAR);
        this.manejarError(error, 'eliminar');
      }
    });
  }
  
  /**
   * Crea un nuevo deporte
   */
  crearDeporte(): void {
    if (!this.validarDeporte()) return;
    
    this.isLoading = true;
    
    this.databaseService.crearDeporte(this.deporteActual).subscribe({
      next: () => {
        this.cerrarModal(TipoModal.CREAR);
        this.cargarDeportes();
      },
      error: (error: HttpErrorResponse) => {
        this.manejarError(error, 'crear');
      }
    });
  }
  
  /**
   * Actualiza un deporte existente
   */
  actualizarDeporte(): void {
    if (!this.validarDeporte() || !this.deporteActual.id) return;
    
    this.isLoading = true;
    
    this.databaseService.actualizarDeporte(this.deporteActual.id, this.deporteActual).subscribe({
      next: () => {
        this.cerrarModal(TipoModal.EDITAR);
        this.cargarDeportes();
      },
      error: (error: HttpErrorResponse) => {
        this.manejarError(error, 'actualizar');
      }
    });
  }
  
  /**
   * Valida los campos del deporte antes de enviarlo
   */
  private validarDeporte(): boolean {
    if (!this.deporteActual.nombre) {
      this.errorMessage = 'El nombre del deporte es obligatorio';
      return false;
    }
    return true;
  }
}

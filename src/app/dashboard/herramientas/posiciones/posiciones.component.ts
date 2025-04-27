import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import { HttpClient } from '@angular/common/http';

// Importar jQuery para manipular los modales
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-posiciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posiciones.component.html',
  styleUrls: ['./posiciones.component.css']
})
export class PosicionesComponent implements OnInit {
  deportes: any[] = [];
  posiciones: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Para el selector de deporte
  deporteSeleccionadoId: number | null = null;
  
  // Para el formulario de creación/edición
  posicionActual: any = {
    id: null,
    nombre: '',
    descripcion: '',
    deporte_id: null
  };
  
  // Control de modales
  mostrarModalCrearPosicion: boolean = false;
  mostrarModalEditarPosicion: boolean = false;
  mostrarModalDetallesPosicion: boolean = false;
  mostrarModalEliminarPosicion: boolean = false;
  
  // Para la búsqueda y filtrado
  terminoBusqueda: string = '';
  posicionesFiltradas: any[] = [];
  
  constructor(private databaseService: DatabaseService, private http: HttpClient) { }

  ngOnInit(): void {
    console.log('Inicializando componente PosicionesComponent');
    this.cargarDeportes();
  }
  
  // Método para cargar deportes desde la base de datos
  cargarDeportes(): void {
    console.log('Iniciando carga de deportes...');
    this.isLoading = true;
    
    // Hacer una solicitud directa al endpoint de deportes
    this.http.get('http://localhost:3000/api/deportes').subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor (deportes):', response);
        this.deportes = response || [];
        console.log('Deportes cargados:', this.deportes.length);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar deportes:', error);
        this.errorMessage = 'Error al cargar los deportes. Por favor, inténtelo de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  // Método para cargar posiciones por deporte
  cargarPosicionesPorDeporte(deporteId: number): void {
    console.log('Iniciando carga de posiciones para deporte ID:', deporteId);
    this.isLoading = true;
    this.errorMessage = '';
    this.posiciones = [];
    this.posicionesFiltradas = [];
    
    // Hacer una solicitud directa al endpoint específico de posiciones por deporte
    this.http.get(`http://localhost:3000/api/posiciones/deporte/${deporteId}`).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor (posiciones):', response);
        this.posiciones = response || [];
        this.posicionesFiltradas = [...this.posiciones];
        console.log('Posiciones cargadas:', this.posiciones.length);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar posiciones:', error);
        this.errorMessage = 'Error al cargar las posiciones. Por favor, inténtelo de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  // Método para manejar el cambio de deporte seleccionado
  onDeporteChange(event: any): void {
    const deporteId = parseInt(event.target.value);
    console.log('Deporte seleccionado ID:', deporteId);
    this.deporteSeleccionadoId = deporteId;
    
    if (deporteId) {
      this.cargarPosicionesPorDeporte(deporteId);
    } else {
      this.posiciones = [];
      this.posicionesFiltradas = [];
    }
  }
  
  // Métodos para buscar posiciones
  buscarPosiciones(): void {
    if (!this.terminoBusqueda.trim()) {
      this.posicionesFiltradas = [...this.posiciones];
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.posicionesFiltradas = this.posiciones.filter(posicion => 
      posicion.nombre.toLowerCase().includes(termino) || 
      (posicion.descripcion && posicion.descripcion.toLowerCase().includes(termino))
    );
  }
  
  // Métodos para el modal de crear posición
  abrirModalCrearPosicion(): void {
    if (!this.deporteSeleccionadoId) {
      alert('Debe seleccionar un deporte primero');
      return;
    }
    
    this.posicionActual = {
      id: null,
      nombre: '',
      descripcion: '',
      deporte_id: this.deporteSeleccionadoId
    };
    
    const modalElement = document.getElementById('crearPosicionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  cerrarModalCrearPosicion(): void {
    const modalElement = document.getElementById('crearPosicionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  
  // Método para crear una posición
  crearPosicion(): void {
    console.log('Creando posición:', this.posicionActual);
    
    if (!this.posicionActual.nombre) {
      this.errorMessage = 'El nombre de la posición es obligatorio';
      return;
    }
    
    if (!this.deporteSeleccionadoId) {
      this.errorMessage = 'Debe seleccionar un deporte';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    // Asegurarnos de que el deporteId esté establecido
    this.posicionActual.deporte_id = this.deporteSeleccionadoId;
    
    // Hacer una solicitud directa al endpoint de crear posición
    this.http.post('http://localhost:3000/api/posiciones', this.posicionActual).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor (crear posición):', response);
        
        // Cerrar el modal
        const modalElement = document.getElementById('crearPosicionModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        // Recargar la lista de posiciones
        this.cargarPosicionesPorDeporte(this.deporteSeleccionadoId!);
      },
      error: (error: any) => {
        console.error('Error al crear posición:', error);
        this.errorMessage = 'Error al crear la posición. Por favor, inténtelo de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  // Métodos para el modal de editar posición
  abrirModalEditarPosicion(posicion: any): void {
    this.posicionActual = { ...posicion };
    
    const modalElement = document.getElementById('editarPosicionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  cerrarModalEditarPosicion(): void {
    const modalElement = document.getElementById('editarPosicionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  
  // Método para actualizar una posición
  actualizarPosicion(): void {
    if (!this.posicionActual.nombre.trim()) {
      alert('El nombre de la posición es obligatorio');
      return;
    }
    
    this.isLoading = true;
    this.databaseService.actualizarPosicion(this.posicionActual.id, this.posicionActual).subscribe({
      next: (response: any) => {
        console.log('Posición actualizada:', response);
        this.cerrarModalEditarPosicion();
        this.cargarPosicionesPorDeporte(this.deporteSeleccionadoId!);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar posición:', error);
        alert('Error al actualizar la posición. Por favor, inténtelo de nuevo.');
        this.isLoading = false;
      }
    });
  }
  
  // Métodos para el modal de detalles de la posición
  abrirModalDetallesPosicion(posicion: any): void {
    this.posicionActual = { ...posicion };
    
    const modalElement = document.getElementById('detallesPosicionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  cerrarModalDetallesPosicion(): void {
    const modalElement = document.getElementById('detallesPosicionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  
  // Método para obtener el nombre del deporte a partir de su ID
  getNombreDeporte(deporteId: number): string {
    const deporte = this.deportes.find(d => d.id === deporteId);
    return deporte ? deporte.nombre : 'Desconocido';
  }
  
  // Método para abrir el modal de eliminación de posición
  abrirModalEliminarPosicion(posicion: any): void {
    this.posicionActual = { ...posicion };
    
    // Abrir el modal usando Bootstrap
    const modalElement = document.getElementById('eliminarPosicionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  // Método para cerrar el modal de eliminación de posición
  cerrarModalEliminarPosicion(): void {
    // Cerrar el modal usando Bootstrap
    const modalElement = document.getElementById('eliminarPosicionModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    // Limpiar la posición actual
    this.posicionActual = { id: 0, nombre: '', descripcion: '', deporte_id: this.deporteSeleccionadoId || 0 };
  }
  
  // Método para eliminar una posición
  eliminarPosicion(): void {
    console.log('Iniciando eliminación de posición:', this.posicionActual);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Hacer una solicitud directa al endpoint de eliminación de posiciones
    this.http.delete(`http://localhost:3000/api/posiciones/${this.posicionActual.id}`).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor (eliminación de posición):', response);
        
        // Mostrar mensaje de éxito
        this.successMessage = 'Posición eliminada correctamente';
        
        // Cerrar el modal
        const modalElement = document.getElementById('eliminarPosicionModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        // Recargar las posiciones
        this.cargarPosicionesPorDeporte(this.deporteSeleccionadoId!);
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
        // Actualizar estado de carga
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al eliminar posición:', error);
        
        // Mostrar mensaje de error
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Error al eliminar la posición. Por favor, inténtelo de nuevo.';
        }
        
        // Cerrar el modal
        const modalElement = document.getElementById('eliminarPosicionModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        // Actualizar estado de carga
        this.isLoading = false;
        
        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      },
      complete: () => {
        // Asegurarse de que el estado de carga se actualiza correctamente
        this.isLoading = false;
      }
    });
  }
}

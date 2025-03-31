import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Importación dinámica de Bootstrap
let bootstrap: any;

interface Fase {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
}

interface FiltrosFase {
  duracion: string;
}

@Component({
  selector: 'app-fases',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './fases.component.html',
  styleUrls: ['./fases.component.css']
})
export class FasesComponent implements OnInit {
  // Propiedades para datos
  fases: Fase[] = [];
  fasesFiltradas: Fase[] = [];
  fasesPaginadas: Fase[] = [];
  faseSeleccionada: Fase | null = null;
  nuevaFase: Fase = { id: 0, nombre: '', descripcion: '', duracion: 4 };
  
  // Propiedades para filtrado y búsqueda
  terminoBusqueda: string = '';
  mostrarFiltros: boolean = false;
  filtros: FiltrosFase = { duracion: '' };
  
  // Propiedades para paginación
  paginaActual: number = 1;
  resultadosPorPagina: number = 5;
  Math = Math; // Para usar Math en el template
  
  // Opciones para modales
  modalOptions = {
    backdrop: 'static' as 'static',
    keyboard: false
  };

  // Variable para verificar si estamos en el navegador
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    // Cargar datos de ejemplo (esto se reemplazará con una llamada a API)
    this.cargarFasesEjemplo();
    this.aplicarFiltrosYBusqueda();

    // Cargar Bootstrap solo en el navegador
    if (this.isBrowser) {
      try {
        bootstrap = await import('bootstrap');
      } catch (error) {
        console.error('Error al cargar Bootstrap:', error);
      }
    }
  }

  cargarFasesEjemplo() {
    // Esto es solo para demostración, se reemplazará con datos reales de la API
    this.fases = [
      { id: 1, nombre: 'Fase de Adaptación', descripcion: 'Fase inicial para adaptación al entrenamiento', duracion: 4 },
      { id: 2, nombre: 'Fase de Hipertrofia', descripcion: 'Fase enfocada en el aumento de masa muscular', duracion: 6 },
      { id: 3, nombre: 'Fase de Fuerza', descripcion: 'Fase enfocada en el aumento de fuerza', duracion: 8 },
      { id: 4, nombre: 'Fase de Definición', descripcion: 'Fase enfocada en la definición muscular', duracion: 12 },
      { id: 5, nombre: 'Fase de Mantenimiento', descripcion: 'Fase para mantener los resultados obtenidos', duracion: 4 },
      { id: 6, nombre: 'Fase de Recuperación', descripcion: 'Fase para recuperación después de un periodo intenso', duracion: 4 },
      { id: 7, nombre: 'Fase de Potencia', descripcion: 'Fase enfocada en mejorar la potencia muscular', duracion: 6 }
    ];
    this.aplicarFiltrosYBusqueda();
  }

  // Métodos para modales
  abrirModalCrearFase() {
    if (!this.isBrowser || !bootstrap) return;
    
    this.nuevaFase = { id: 0, nombre: '', descripcion: '', duracion: 4 };
    const modalElement = document.getElementById('crearFaseModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, this.modalOptions);
      modal.show();
    }
  }

  abrirModalEditarFase(fase: Fase) {
    if (!this.isBrowser || !bootstrap) return;
    
    this.faseSeleccionada = { ...fase };
    const modalElement = document.getElementById('editarFaseModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, this.modalOptions);
      modal.show();
    }
  }

  verDetallesFase(fase: Fase) {
    if (!this.isBrowser || !bootstrap) return;
    
    this.faseSeleccionada = { ...fase };
    const modalElement = document.getElementById('detallesFaseModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, this.modalOptions);
      modal.show();
    }
  }

  // Métodos para gestión de fases
  guardarNuevaFase() {
    if (this.nuevaFase.nombre.trim() === '') {
      alert('El nombre de la fase es obligatorio');
      return;
    }

    // Asignar un ID único (en una aplicación real, esto lo haría el backend)
    const nuevoId = Math.max(...this.fases.map(f => f.id), 0) + 1;
    const nuevaFase: Fase = {
      ...this.nuevaFase,
      id: nuevoId
    };

    // Agregar la nueva fase al array
    this.fases.push(nuevaFase);
    
    // Cerrar el modal
    if (this.isBrowser && bootstrap) {
      const modalElement = document.getElementById('crearFaseModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
    
    // Actualizar la vista
    this.aplicarFiltrosYBusqueda();
  }

  guardarCambiosFase() {
    if (!this.faseSeleccionada) return;
    
    if (this.faseSeleccionada.nombre.trim() === '') {
      alert('El nombre de la fase es obligatorio');
      return;
    }

    // Actualizar la fase en el array
    const index = this.fases.findIndex(f => f.id === this.faseSeleccionada!.id);
    if (index !== -1) {
      this.fases[index] = { ...this.faseSeleccionada };
    }
    
    // Cerrar el modal
    if (this.isBrowser && bootstrap) {
      const modalElement = document.getElementById('editarFaseModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
    
    // Actualizar la vista
    this.aplicarFiltrosYBusqueda();
  }

  eliminarFase(fase: Fase) {
    if (confirm(`¿Estás seguro de que deseas eliminar la fase "${fase.nombre}"?`)) {
      // Eliminar la fase del array
      this.fases = this.fases.filter(f => f.id !== fase.id);
      
      // Actualizar la vista
      this.aplicarFiltrosYBusqueda();
    }
  }

  // Métodos para filtrado y búsqueda
  aplicarFiltrosYBusqueda() {
    // Aplicar filtros
    this.fasesFiltradas = this.fases.filter(fase => {
      // Filtro por duración
      if (this.filtros.duracion && fase.duracion.toString() !== this.filtros.duracion) {
        return false;
      }
      
      // Filtro por término de búsqueda
      if (this.terminoBusqueda.trim() !== '') {
        const termino = this.terminoBusqueda.toLowerCase();
        return fase.nombre.toLowerCase().includes(termino) || 
               fase.descripcion.toLowerCase().includes(termino);
      }
      
      return true;
    });
    
    // Actualizar paginación
    this.cambiarPagina(1);
  }

  buscarFases() {
    this.aplicarFiltrosYBusqueda();
  }

  aplicarFiltros() {
    this.aplicarFiltrosYBusqueda();
    this.mostrarFiltros = false;
  }

  limpiarFiltros() {
    this.filtros = { duracion: '' };
    this.aplicarFiltrosYBusqueda();
  }

  // Métodos para paginación
  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.resultadosPorPagina;
    const fin = inicio + this.resultadosPorPagina;
    this.fasesPaginadas = this.fasesFiltradas.slice(inicio, fin);
  }
}

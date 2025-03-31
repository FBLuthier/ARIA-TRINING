import { Component, OnInit, ViewChild, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RutinaService } from '../rutinas/services/rutina.service';
import { VerRutinaComponent } from '../rutinas/ver-rutina/ver-rutina.component';
import { CrearRutinasComponent } from '../rutinas/crear-rutinas/crear-rutinas.component';
import { HistorialRutinasComponent } from '../rutinas/historial-rutinas/historial-rutinas.component';

// Importación dinámica de Bootstrap
let bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    VerRutinaComponent, 
    CrearRutinasComponent, 
    HistorialRutinasComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  // Propiedad Math para usar en la plantilla
  Math = Math;
  
  // Datos de usuarios (simulados)
  usuarios = [
    {
      id: 1,
      primerNombre: 'Juan',
      segundoNombre: 'Carlos',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      telefono: '555-123-4567',
      email: 'juan.perez@ejemplo.com',
      tieneRutina: true,
      tieneHistorialRutinas: true,
      programa: 'Acondicionamiento',
      deporte: 'Fútbol',
      posicion: 'Delantero',
      lesiones: 'Rodilla derecha',
      dob: '1990-05-15',
      documentos: {
        contrato: 'documentos/contrato_juan_perez.pdf',
        consentimiento: 'documentos/consentimiento_juan_perez.pdf',
        motivacion: '',
        evaluacion: 'documentos/evaluacion_juan_perez.pdf',
        otros: ''
      },
      mostrarDetalles: false
    },
    {
      id: 2,
      primerNombre: 'María',
      segundoNombre: '',
      primerApellido: 'Rodríguez',
      segundoApellido: 'López',
      telefono: '555-987-6543',
      email: 'maria.rodriguez@ejemplo.com',
      tieneRutina: false,
      tieneHistorialRutinas: false,
      programa: 'Recomposición',
      deporte: 'Natación',
      posicion: 'N/A',
      lesiones: 'Ninguna',
      dob: '1988-11-23',
      documentos: {
        contrato: 'documentos/contrato_maria_rodriguez.pdf',
        consentimiento: '',
        motivacion: 'documentos/motivacion_maria_rodriguez.pdf',
        evaluacion: '',
        otros: ''
      },
      mostrarDetalles: false
    },
    {
      id: 3,
      primerNombre: 'Roberto',
      segundoNombre: 'Alejandro',
      primerApellido: 'González',
      segundoApellido: '',
      telefono: '555-456-7890',
      email: 'roberto.gonzalez@ejemplo.com',
      tieneRutina: true,
      tieneHistorialRutinas: true,
      programa: 'Hipertrofia',
      deporte: 'Baloncesto',
      posicion: 'Base',
      lesiones: 'Tobillo izquierdo',
      dob: '1992-08-07',
      documentos: {
        contrato: 'documentos/contrato_roberto_gonzalez.pdf',
        consentimiento: 'documentos/consentimiento_roberto_gonzalez.pdf',
        motivacion: 'documentos/motivacion_roberto_gonzalez.pdf',
        evaluacion: 'documentos/evaluacion_roberto_gonzalez.pdf',
        otros: ''
      },
      mostrarDetalles: false
    }
  ];

  // Variables para la paginación
  totalUsuarios = 24;
  paginaActual = 1;
  resultadosPorPagina = 4;

  // Variable para la búsqueda
  terminoBusqueda = '';

  // Variables para filtrado
  usuariosFiltrados: any[] = [];
  filtrosActivos: boolean = false;
  filtros: any = {
    programa: '',
    deporte: '',
    tieneRutina: null
  };

  // Usuario que se está editando actualmente
  usuarioEditando: any = null;

  // Variables para controlar los modales
  mostrarModalCrearUsuario: boolean = false;
  mostrarModalEditarUsuario: boolean = false;
  mostrarModalVerRutina: boolean = false;
  mostrarModalCrearRutina: boolean = false;
  mostrarModalEditarRutina: boolean = false;
  mostrarModalHistorialRutinas: boolean = false;
  
  // Usuario seleccionado para operaciones
  usuarioSeleccionado: any = null;
  
  // ID de la rutina seleccionada
  rutinaSeleccionadaId: number | null = null;

  // Variable para verificar si estamos en el navegador
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private rutinaService: RutinaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    // Inicializar bootstrap para los modales solo en el navegador
    if (this.isBrowser) {
      try {
        bootstrap = await import('bootstrap');
      } catch (error) {
        console.error('Error al cargar Bootstrap:', error);
      }
    }
    
    // Inicializar los usuarios filtrados con todos los usuarios
    this.usuariosFiltrados = [...this.usuarios];
  }

  ngAfterViewInit(): void {
    // Inicializar dropdowns solo en el navegador
    if (this.isBrowser && bootstrap) {
      this.inicializarDropdowns();
    }
  }

  // Método para inicializar los dropdowns de Bootstrap manualmente
  inicializarDropdowns(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggleEl => {
      new bootstrap.Dropdown(dropdownToggleEl);
    });
  }

  // Método para abrir un documento
  abrirDocumento(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Método para buscar usuarios
  buscarUsuarios(): void {
    // Reiniciar la página actual al buscar
    this.paginaActual = 1;
    
    // Si no hay término de búsqueda y no hay filtros activos, mostrar todos los usuarios
    if (!this.terminoBusqueda.trim() && !this.filtrosActivos) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    
    // Filtrar usuarios según el término de búsqueda
    let resultados = [...this.usuarios];
    
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultados = resultados.filter(usuario => {
        const nombreCompleto = `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`.toLowerCase();
        const email = usuario.email.toLowerCase();
        const id = usuario.id.toString();
        
        return nombreCompleto.includes(termino) || 
               email.includes(termino) || 
               id.includes(termino);
      });
    }
    
    // Aplicar filtros adicionales si están activos
    if (this.filtrosActivos) {
      if (this.filtros.programa) {
        resultados = resultados.filter(u => u.programa === this.filtros.programa);
      }
      
      if (this.filtros.deporte) {
        resultados = resultados.filter(u => u.deporte === this.filtros.deporte);
      }
      
      if (this.filtros.tieneRutina !== null) {
        resultados = resultados.filter(u => u.tieneRutina === this.filtros.tieneRutina);
      }
    }
    
    this.usuariosFiltrados = resultados;
  }
  
  // Método para abrir/cerrar el panel de filtros
  toggleFiltros(): void {
    if (!this.isBrowser) return;
    
    const filtrosPanel = document.getElementById('filtrosPanel');
    if (filtrosPanel) {
      if (filtrosPanel.classList.contains('d-none')) {
        filtrosPanel.classList.remove('d-none');
      } else {
        filtrosPanel.classList.add('d-none');
      }
    }
  }
  
  // Método para aplicar filtros
  aplicarFiltros(): void {
    this.filtrosActivos = this.filtros.programa !== '' || 
                         this.filtros.deporte !== '' || 
                         this.filtros.tieneRutina !== null;
    
    this.buscarUsuarios();
  }
  
  // Método para limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtros = {
      programa: '',
      deporte: '',
      tieneRutina: null
    };
    
    this.filtrosActivos = false;
    this.terminoBusqueda = '';
    this.buscarUsuarios();
    
    // Mantener el panel de filtros abierto después de limpiar
    // para que el usuario pueda ver que los filtros se han limpiado
  }

  // Método para abrir el modal de crear usuario
  abrirModalCrearUsuario(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Método para cerrar el modal de crear usuario
  cerrarModalCrearUsuario(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  // Métodos para modales de rutinas
  abrirModalCrearRutina(usuario?: any): void {
    if (!this.isBrowser || !bootstrap) return;
    
    this.usuarioSeleccionado = usuario || null;
    const modalElement = document.getElementById('crearRutinaModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModalCrearRutina(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const modalElement = document.getElementById('crearRutinaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  abrirModalEditarRutina(usuario: any, rutinaId: number): void {
    if (!this.isBrowser || !bootstrap) return;
    
    this.usuarioSeleccionado = usuario;
    this.rutinaSeleccionadaId = rutinaId;
    const modalElement = document.getElementById('editarRutinaModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModalEditarRutina(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const modalElement = document.getElementById('editarRutinaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  abrirModalVerRutina(usuario: any, rutinaId: number): void {
    if (!this.isBrowser || !bootstrap) return;
    
    this.usuarioSeleccionado = usuario;
    this.rutinaSeleccionadaId = rutinaId;
    const modalElement = document.getElementById('verRutinaModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModalVerRutina(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    const modalElement = document.getElementById('verRutinaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  cerrarModalHistorialRutinas(): void {
    this.mostrarModalHistorialRutinas = false;
    this.usuarioSeleccionado = null;
  }

  // Métodos para manejar las rutinas
  crearRutina(usuario: any): void {
    console.log('Método crearRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    this.abrirModalCrearRutina(usuario);
  }

  editarRutina(usuario: any): void {
    console.log('Método editarRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    
    this.rutinaService.obtenerRutinaActiva(usuario.id).subscribe({
      next: (rutina) => {
        if (rutina) {
          this.abrirModalEditarRutina(usuario, rutina.id);
        } else {
          console.error('No se encontró una rutina activa para este usuario');
          alert('No se encontró una rutina activa para este usuario');
        }
      },
      error: (error) => {
        console.error('Error al obtener la rutina activa:', error);
        alert('Error al obtener la rutina activa');
      }
    });
  }

  archivarRutina(usuario: any): void {
    console.log('Método archivarRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    
    if (confirm(`¿Está seguro que desea archivar la rutina de ${usuario.primerNombre} ${usuario.primerApellido}?`)) {
      this.rutinaService.archivarRutina(usuario.id).subscribe({
        next: (resultado) => {
          if (resultado) {
            console.log('Rutina archivada correctamente');
            alert('Rutina archivada correctamente');
            // Actualizar el estado del usuario
            usuario.tieneRutina = false;
          } else {
            console.error('No se pudo archivar la rutina');
            alert('No se pudo archivar la rutina');
          }
        },
        error: (error) => {
          console.error('Error al archivar la rutina:', error);
          alert('Error al archivar la rutina');
        }
      });
    }
  }

  verHistorialRutinas(usuario: any): void {
    console.log('Método verHistorialRutinas ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    // Aquí se implementaría la lógica para mostrar el historial de rutinas
  }

  verRutina(usuario: any): void {
    console.log('Método verRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    
    this.rutinaService.obtenerRutinaActiva(usuario.id).subscribe({
      next: (rutina) => {
        if (rutina) {
          this.abrirModalVerRutina(usuario, rutina.id);
        } else {
          console.error('No se encontró una rutina activa para este usuario');
          alert('No se encontró una rutina activa para este usuario');
        }
      },
      error: (error) => {
        console.error('Error al obtener la rutina activa:', error);
        alert('Error al obtener la rutina activa');
      }
    });
  }
  
  // Método para agregar un nuevo usuario a la lista
  agregarUsuario(nuevoUsuario: any): void {
    console.log('Agregando nuevo usuario:', nuevoUsuario);
    
    // Agregar el usuario al inicio del array
    this.usuarios.unshift(nuevoUsuario);
    
    // Actualizar el total de usuarios
    this.totalUsuarios++;
    
    // En un entorno real, aquí se enviaría el usuario al backend
    // y se actualizaría la lista después de recibir confirmación
  }
  
  // Método para editar un usuario
  editarUsuario(usuario: any): void {
    console.log('Editando usuario:', usuario);
    
    // Crear una copia del usuario para no modificar el original directamente
    this.usuarioEditando = { ...usuario };
    
    // Abrir el modal de creación de usuario en modo edición
    const modal = document.getElementById('crearUsuarioModal');
    if (modal) {
      // @ts-ignore
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }
  
  // Método para manejar el evento de usuario editado
  onUsuarioEditado(usuarioEditado: any): void {
    // Encontrar el índice del usuario en el array
    const index = this.usuarios.findIndex(u => u.id === usuarioEditado.id);
    
    if (index !== -1) {
      // Actualizar el usuario en el array
      this.usuarios[index] = usuarioEditado;
      
      // Mostrar mensaje de éxito
      alert(`Usuario ${usuarioEditado.primerNombre} ${usuarioEditado.primerApellido} actualizado correctamente`);
      
      // Limpiar el usuario que se está editando
      this.usuarioEditando = null;
    } else {
      console.error('No se encontró el usuario a actualizar');
    }
  }
  
  // Método para confirmar la eliminación de un usuario
  confirmarEliminarUsuario(usuario: any): void {
    if (confirm(`¿Está seguro que desea eliminar al usuario ${usuario.primerNombre} ${usuario.primerApellido}?`)) {
      this.eliminarUsuario(usuario);
    }
  }
  
  // Método para eliminar un usuario
  eliminarUsuario(usuario: any): void {
    console.log('Eliminando usuario:', usuario);
    // Aquí se implementaría la lógica para eliminar el usuario de la base de datos
    // Por ahora, lo eliminaremos del array local
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    // Mostrar mensaje de éxito
    alert(`Usuario ${usuario.primerNombre} ${usuario.primerApellido} eliminado correctamente`);
  }

  /**
   * Muestra u oculta los detalles de un usuario
   */
  toggleDetallesUsuario(usuario: any): void {
    // Cerrar todos los demás detalles
    this.usuarios.forEach(u => {
      if (u.id !== usuario.id) {
        u.mostrarDetalles = false;
      }
    });
    
    // Alternar visibilidad para el usuario seleccionado
    usuario.mostrarDetalles = !usuario.mostrarDetalles;
  }
  
  /**
   * Verifica si los detalles de un usuario están visibles
   */
  esDetalleVisible(usuarioId: number): boolean {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.mostrarDetalles : false;
  }

  // Método para cambiar de página
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    // Aquí se cargarían los datos de la página correspondiente
  }
}

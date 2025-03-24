import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearUsuariosComponent } from './crear-usuarios/crear-usuarios.component';
import { Router } from '@angular/router';
import { RutinaService } from '../rutinas/services/rutina.service';
import { VerRutinaComponent } from '../rutinas/ver-rutina/ver-rutina.component';
import { CrearRutinasComponent } from '../rutinas/crear-rutinas/crear-rutinas.component';
import { HistorialRutinasComponent } from '../rutinas/historial-rutinas/historial-rutinas.component';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CrearUsuariosComponent, 
    VerRutinaComponent, 
    CrearRutinasComponent, 
    HistorialRutinasComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  // Referencia al componente hijo
  @ViewChild('crearUsuariosComponent') crearUsuariosComponent!: CrearUsuariosComponent;

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

  constructor(private router: Router, private rutinaService: RutinaService) { }

  ngOnInit(): void {
    // Aquí se cargarían los datos desde el servicio cuando se implemente
  }

  ngAfterViewInit(): void {
    // Inicializar los dropdowns de Bootstrap manualmente después de que la vista se haya cargado
    setTimeout(() => {
      this.inicializarDropdowns();
    }, 500);
  }

  // Método para inicializar los dropdowns de Bootstrap manualmente
  inicializarDropdowns(): void {
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
    console.log('Buscando usuarios con término:', this.terminoBusqueda);
    // Aquí iría la lógica de búsqueda cuando se conecte con la base de datos
  }

  // Método para cambiar de página
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    // Aquí se cargarían los datos de la página correspondiente
  }

  // Método para abrir el modal de crear usuario
  abrirModalCrearUsuario(): void {
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      // Configurar opciones del modal para manejar eventos de cierre
      const modalOptions = {
        backdrop: 'static', // Evita que se cierre al hacer clic fuera
        keyboard: false     // Evita que se cierre con la tecla Escape
      };
      
      const modal = new bootstrap.Modal(modalElement, modalOptions);
      
      // Agregar listener para el evento hidden.bs.modal
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Asegurarse de que se limpie todo correctamente
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      });
      
      modal.show();
    }
  }

  // Método para cerrar el modal de crear usuario
  cerrarModalCrearUsuario(): void {
    // Cerrar el modal
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      try {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      } catch (error) {
        console.error('Error al cerrar el modal:', error);
      }
      
      // Limpiar manualmente los elementos del modal
      this.limpiarElementosModal();
    }
    
    // Limpiar el usuario que se está editando
    this.usuarioEditando = null;
    
    // Resetear el modo edición en el componente hijo
    if (this.crearUsuariosComponent) {
      this.crearUsuariosComponent.modoEdicion = false;
      this.crearUsuariosComponent.usuarioParaEditar = null;
      this.crearUsuariosComponent.resetForm();
    }
  }
  
  // Método para limpiar los elementos del modal
  limpiarElementosModal(): void {
    // Remover clases y estilos del body
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    
    // Remover el backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Asegurarse de que el modal esté oculto
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
    }
  }

  // Método para abrir el modal de crear rutina
  abrirModalCrearRutina(usuarioId: number): void {
    console.log('Abriendo modal para crear rutina para el usuario ID:', usuarioId);
    // Aquí iría la lógica para abrir el modal de crear rutina
    this.router.navigate(['/rutinas/crear', usuarioId]);
  }

  // Método para abrir el modal de editar rutina
  abrirModalEditarRutina(usuarioId: number): void {
    console.log('Abriendo modal para editar rutina del usuario ID:', usuarioId);
    // Aquí iría la lógica para abrir el modal de editar rutina
    this.router.navigate(['/rutinas/editar', usuarioId]);
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
      
      // Asignar los datos al componente hijo después de un breve retraso
      setTimeout(() => {
        if (this.crearUsuariosComponent) {
          this.crearUsuariosComponent.modoEdicion = true;
          this.crearUsuariosComponent.usuarioParaEditar = this.usuarioEditando;
          this.crearUsuariosComponent.cargarDatosUsuario();
        }
      }, 100);
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

  // Métodos para manejar las rutinas
  crearRutina(usuario: any): void {
    console.log('Método crearRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    this.usuarioSeleccionado = usuario;
    this.mostrarModalCrearRutina = true;
    // Alternativa: navegar a la página de crear rutina
    // this.router.navigate(['/dashboard/rutinas/crear'], { queryParams: { usuarioId: usuario.id } });
  }

  editarRutina(usuario: any): void {
    console.log('Método editarRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    
    // Primero obtenemos la rutina activa del usuario
    this.rutinaService.obtenerRutinaActiva(usuario.id).subscribe({
      next: (rutina) => {
        if (rutina) {
          this.usuarioSeleccionado = usuario;
          this.rutinaSeleccionadaId = rutina.id;
          this.mostrarModalEditarRutina = true;
          // Alternativa: navegar a la página de editar rutina
          // this.router.navigate(['/dashboard/rutinas/editar', rutina.id]);
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
    this.usuarioSeleccionado = usuario;
    this.mostrarModalHistorialRutinas = true;
    // Alternativa: navegar a la página de historial de rutinas
    // this.router.navigate(['/dashboard/rutinas/historial'], { queryParams: { usuarioId: usuario.id } });
  }

  verRutina(usuario: any): void {
    console.log('Método verRutina ejecutado para usuario:', usuario.id, usuario.primerNombre, usuario.primerApellido);
    
    // Primero obtenemos la rutina activa del usuario
    this.rutinaService.obtenerRutinaActiva(usuario.id).subscribe({
      next: (rutina) => {
        if (rutina) {
          this.usuarioSeleccionado = usuario;
          this.rutinaSeleccionadaId = rutina.id;
          this.mostrarModalVerRutina = true;
          // Alternativa: navegar a la página de ver rutina
          // this.router.navigate(['/dashboard/rutinas/ver', rutina.id]);
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
  
  // Métodos para cerrar los modales de rutina
  cerrarModalVerRutina(): void {
    this.mostrarModalVerRutina = false;
    this.usuarioSeleccionado = null;
    this.rutinaSeleccionadaId = null;
  }
  
  cerrarModalCrearRutina(): void {
    this.mostrarModalCrearRutina = false;
    this.usuarioSeleccionado = null;
  }
  
  cerrarModalEditarRutina(): void {
    this.mostrarModalEditarRutina = false;
    this.usuarioSeleccionado = null;
    this.rutinaSeleccionadaId = null;
  }
  
  cerrarModalHistorialRutinas(): void {
    this.mostrarModalHistorialRutinas = false;
    this.usuarioSeleccionado = null;
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
}

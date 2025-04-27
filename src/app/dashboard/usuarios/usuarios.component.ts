import { Component, OnInit, ViewChild, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RutinaService } from '../rutinas/services/rutina.service';
import { VerRutinaComponent } from '../rutinas/ver-rutina/ver-rutina.component';
import { CrearRutinasComponent } from '../rutinas/crear-rutinas/crear-rutinas.component';
import { HistorialRutinasComponent } from '../rutinas/historial-rutinas/historial-rutinas.component';
import { CrearUsuariosComponent } from './crear-usuarios/crear-usuarios.component';
import { DatabaseService } from '../../services/database.service';

// Interfaces para mejorar el tipado
interface Usuario {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  email: string;
  dob: string;
  programa: string;
  deporte: string | number;
  deporteId?: number;
  deporteNombre?: string;
  posicion: string | number;
  posicionId?: number;
  posicionNombre?: string;
  lesiones?: string;
  tieneRutina: boolean;
  tieneHistorialRutinas: boolean;
  documentos: {
    contrato?: string;
    consentimiento?: string;
    motivacion?: string;
    evaluacion?: string;
    otros?: string;
  };
  mostrarDetalles?: boolean;
}

interface Filtros {
  programa: string;
  deporteId: string;
  tieneRutina: boolean | null;
}

interface FormularioEdicion {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
  email: string;
  programa: string;
  deporteId: string | number;
  posicionId: string | number;
  lesiones: string;
  dob: string;
}

interface Deporte {
  id: number;
  nombre: string;
}

interface Posicion {
  id: number;
  nombre: string;
  deporteId?: number;
}

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
    HistorialRutinasComponent,
    CrearUsuariosComponent
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  // Propiedades para el componente
  Math = Math;
  usuarios: Usuario[] = [];
  cargando = false; 
  datosListos = false; 
  errorMessage = '';
  totalUsuarios = 24;
  paginaActual = 1;
  resultadosPorPagina = 4;
  usuariosFiltrados: Usuario[] = [];
  filtrosActivos = false;
  filtros: Filtros = {
    programa: '',
    deporteId: '',
    tieneRutina: null
  };
  busqueda = {
    termino: ''
  };
  detallesVisibles: { [key: number]: boolean } = {}; 
  usuarioEditando: Usuario | null = null;
  formularioEdicion: FormularioEdicion = this.inicializarFormularioVacio();
  modalCrearUsuarioVisible = false;
  modalEditarUsuarioVisible = false;
  modalVerRutinaVisible = false;
  modalCrearRutinaVisible = false;
  modalEditarRutinaVisible = false;
  modalHistorialRutinasVisible = false;
  usuarioSeleccionado: Usuario | null = null;
  rutinaSeleccionadaId: number | null = null;
  private isBrowser: boolean;
  deportes: Deporte[] = [];
  posiciones: Posicion[] = [];

  constructor(
    private router: Router,
    private rutinaService: RutinaService,
    private databaseService: DatabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    console.log('Inicializando componente Usuarios...');
    
    // Inicializar Bootstrap si estamos en el navegador
    if (this.isBrowser) {
      this.cargarBootstrap();
    }
    
    // Cargar datos de prueba directamente para evitar problemas de conexión
    this.cargarDatosDePrueba();
    
    // También intentamos cargar los deportes por si acaso
    this.cargarDeportes();
    
    // Marcamos que los datos están listos
    this.datosListos = true;
    this.cargando = false;
  }

  /**
   * Carga dinámica de Bootstrap
   */
  private cargarBootstrap(): void {
    import('bootstrap').then(bs => {
      bootstrap = bs;
      console.log('Bootstrap cargado correctamente');
      
      // Inicializar los dropdowns después de cargar Bootstrap
      this.inicializarDropdowns();
    }).catch(error => {
      console.error('Error al cargar Bootstrap:', error);
    });
  }

  /**
   * Inicializa un formulario de edición vacío
   */
  private inicializarFormularioVacio(): FormularioEdicion {
    return {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      telefono: '',
      email: '',
      programa: '',
      deporteId: '',
      posicionId: '',
      lesiones: '',
      dob: ''
    };
  }

  ngAfterViewInit(): void {
    // Inicializar dropdowns solo en el navegador
    if (this.isBrowser && bootstrap) {
      this.inicializarDropdowns();
    }
  }

  // Método para abrir el modal de edición
  abrirModalEditarUsuario(usuario: Usuario): void {
    console.log('Abriendo modal de edición para usuario:', usuario);
    
    this.usuarioEditando = { ...usuario };
    
    // Obtener los valores del usuario para el formulario
    const primerNombre = usuario.primerNombre || '';
    const segundoNombre = usuario.segundoNombre || '';
    const primerApellido = usuario.primerApellido || '';
    const segundoApellido = usuario.segundoApellido || '';
    const telefono = usuario.telefono || '';
    const email = usuario.email || '';
    const programa = usuario.programa || '';
    const deporteId = usuario.deporteId || '';
    const posicionId = usuario.posicionId || '';
    const lesiones = usuario.lesiones || '';
    const fechaNacimiento = usuario.dob || '';
    
    // Inicializar el formulario de edición
    this.formularioEdicion = {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      telefono,
      email,
      programa,
      deporteId,
      posicionId,
      lesiones,
      dob: fechaNacimiento
    };
    
    // Cargar las posiciones si tenemos un deporte seleccionado
    if (usuario.deporteId && typeof usuario.deporteId === 'number') {
      const deporteSeleccionado = this.deportes.find(d => d.id === usuario.deporteId);
      
      if (deporteSeleccionado) {
        // Asignamos el nombre del deporte al formulario
        this.formularioEdicion.deporteId = deporteSeleccionado.nombre;
        
        // Cargamos las posiciones para este deporte
        this.cargarPosicionesManualmente(deporteSeleccionado.nombre);
      }
    }
    
    console.log('Formulario de edición inicializado:', this.formularioEdicion);
    
    // Mostrar el modal
    this.mostrarModal('editarUsuarioModal');
  }

  // Método para guardar los cambios de un usuario
  guardarCambiosUsuario(): void {
    if (!this.isBrowser || !bootstrap) return;
    
    console.log('Guardando cambios del usuario:', this.usuarioEditando?.id);
    
    if (!this.usuarioEditando) {
      console.error('No hay usuario seleccionado para editar');
      return;
    }
    
    // Crear una copia del formulario para enviar
    const datosActualizados = { ...this.formularioEdicion };
    
    // Obtener el nombre del deporte a partir del ID seleccionado
    if (datosActualizados.deporteId) {
      const deporteSeleccionado = this.deportes.find(d => d.nombre === datosActualizados.deporteId);
      if (deporteSeleccionado) {
        // Usar el ID del deporte en lugar del nombre
        datosActualizados.deporteId = deporteSeleccionado.id;
      }
    }
    
    // Formatear la fecha de nacimiento si existe
    if (datosActualizados.dob) {
      // La fecha ya está en formato YYYY-MM-DD, que es el formato adecuado para el servidor
      console.log('Fecha de nacimiento a enviar:', datosActualizados.dob);
    }
    
    console.log('Datos a actualizar:', datosActualizados);
    
    this.cargando = true;
    
    // Llamar al servicio para actualizar el usuario en la base de datos
    this.databaseService.updateUsuario(this.usuarioEditando.id, datosActualizados).subscribe({
      next: (response) => {
        console.log('Usuario actualizado correctamente:', response);
        
        // Cerrar el modal de edición
        const modalElement = document.getElementById('modalEditarUsuario');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        // Recargar la lista de usuarios
        this.cargarUsuarios();
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        
        // Manejar el error de email duplicado
        if (error.error && error.error.error === 'EMAIL_EXISTS') {
          alert('Ya existe un usuario con este correo electrónico. Por favor, utilice otro.');
        } else {
          // Mostrar mensaje de error genérico
          alert('Error al actualizar usuario. Por favor, inténtelo de nuevo.');
        }
        
        this.cargando = false;
      }
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.datosListos = false;
    
    console.log('Iniciando carga de usuarios...');
    
    this.databaseService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        console.log('Usuarios recibidos:', usuarios);
        this.usuarios = usuarios || [];
        
        // Procesar los usuarios para obtener los nombres de deportes y posiciones
        this.usuarios.forEach(usuario => {
          // Guardar los IDs originales en propiedades separadas
          if (typeof usuario.deporte === 'number') {
            usuario.deporteId = usuario.deporte;
          }
          if (typeof usuario.posicion === 'number') {
            usuario.posicionId = usuario.posicion;
          }

          // Buscar los nombres de deportes y posiciones
          this.actualizarNombresDeporteYPosicion(usuario);
        });

        this.usuariosFiltrados = [...this.usuarios];
        this.datosListos = true;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        
        // Si hay un error de conexión, usar datos de prueba
        console.log('Cargando datos de prueba como respaldo');
        this.cargarDatosDePrueba();
        this.datosListos = true;
        this.cargando = false;
      }
    });
  }

  /**
   * Carga la lista de deportes desde la base de datos
   */
  cargarDeportes(): void {
    this.cargando = true;
    
    this.databaseService.getDeportes().subscribe({
      next: (deportes: any[]) => {
        this.deportes = deportes || [];
        
        // Una vez cargados los deportes, cargamos los usuarios
        this.cargarUsuarios();
        this.cargando = false;
      },
      error: () => {
        this.deportes = [];
        this.cargarUsuarios(); // Intentar cargar usuarios aunque fallen los deportes
        this.cargando = false;
      }
    });
  }

  /**
   * Inicializa los elementos Bootstrap dropdown
   */
  inicializarDropdowns(): void {
    if (this.isBrowser && bootstrap) {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      dropdownElementList.forEach(dropdownToggleEl => {
        new bootstrap.Dropdown(dropdownToggleEl);
      });
    }
  }

  /**
   * Carga manualmente las posiciones para un deporte específico
   */
  cargarPosicionesManualmente(nombreDeporte: string): void {
    this.cargando = true;
    this.databaseService.obtenerPosicionesPorNombreDeporte(nombreDeporte).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          this.posiciones = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.posiciones = response.data;
        } else {
          console.error('Formato de respuesta de posiciones inesperado:', response);
          this.posiciones = [];
        }
        console.log('Posiciones cargadas para', nombreDeporte, ':', this.posiciones.length);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar posiciones:', error);
        this.posiciones = [];
        this.cargando = false;
      }
    });
  }

  /**
   * Carga las posiciones para un deporte seleccionado (evento change)
   */
  cargarPosicionesPorDeporte(event: any): void {
    const deporteId = event.target.value;
    if (!deporteId) {
      this.posiciones = [];
      return;
    }
    
    const deporteSeleccionado = this.deportes.find(d => d.id.toString() === deporteId.toString());
    if (deporteSeleccionado) {
      this.cargarPosicionesManualmente(deporteSeleccionado.nombre);
    }
  }

  /**
   * Actualiza los nombres de deportes y posiciones en los usuarios
   */
  actualizarNombresDeporteYPosicion(usuario: Usuario): void {
    if (typeof usuario.deporte === 'number') {
      const deporteEncontrado = this.deportes.find(d => d.id === usuario.deporte);
      if (deporteEncontrado) {
        usuario.deporteNombre = deporteEncontrado.nombre;
      }
    }
    
    // Para posiciones, podríamos necesitar cargar las posiciones específicas para ese deporte
    // pero como ya tenemos el nombre de la posición en la base de datos, podríamos saltarnos este paso
    // o implementarlo más adelante si es necesario
  }

  /**
   * Carga datos de prueba en caso de error al conectar con el backend
   */
  cargarDatosDePrueba(): void {
    console.log('Cargando datos de prueba...');
    this.usuarios = [
      {
        id: 1,
        primerNombre: 'Juan',
        segundoNombre: 'Carlos',
        primerApellido: 'García',
        segundoApellido: 'Pérez',
        telefono: '123456789',
        email: 'juan@example.com',
        dob: '1990-01-01',
        programa: 'Pérdida de peso',
        deporte: 'Fútbol',
        deporteId: 1,
        deporteNombre: 'Fútbol',
        posicion: 'Delantero',
        posicionId: 1,
        posicionNombre: 'Delantero',
        lesiones: 'Ninguna',
        tieneRutina: true,
        tieneHistorialRutinas: true,
        documentos: {}
      },
      {
        id: 2,
        primerNombre: 'Ana',
        segundoNombre: 'María',
        primerApellido: 'López',
        segundoApellido: 'Sánchez',
        telefono: '987654321',
        email: 'ana@example.com',
        dob: '1992-05-15',
        programa: 'Hipertrofia',
        deporte: 'Natación',
        deporteId: 2,
        deporteNombre: 'Natación',
        posicion: 'Estilo libre',
        posicionId: 5,
        posicionNombre: 'Estilo libre',
        lesiones: 'Tendinitis en el hombro',
        tieneRutina: false,
        tieneHistorialRutinas: false,
        documentos: {}
      },
      {
        id: 3,
        primerNombre: 'Pedro',
        primerApellido: 'Martínez',
        telefono: '555555555',
        email: 'pedro@example.com',
        dob: '1988-12-10',
        programa: 'Recomposición',
        deporte: 'Baloncesto',
        deporteId: 3,
        deporteNombre: 'Baloncesto',
        posicion: 'Base',
        posicionId: 10,
        posicionNombre: 'Base',
        lesiones: 'Esguince de tobillo (recuperado)',
        tieneRutina: true,
        tieneHistorialRutinas: true,
        documentos: {}
      }
    ];
    
    this.usuariosFiltrados = [...this.usuarios];
    console.log('Datos de prueba cargados:', this.usuarios.length);
  }

  /**
   * Mostramos u ocultamos el panel de filtros
   */
  mostrarOcultarFiltros(): void {
    this.filtrosActivos = !this.filtrosActivos;
    const filtrosPanel = document.getElementById('filtrosPanel');
    if (filtrosPanel) {
      filtrosPanel.classList.toggle('d-none', !this.filtrosActivos);
    }
  }

  /**
   * Aplicamos la búsqueda por texto
   */
  aplicarBusqueda(): void {
    if (!this.busqueda.termino || this.busqueda.termino.trim() === '') {
      // Si no hay término de búsqueda, mostramos todos los usuarios (aplicando otros filtros si existen)
      this.aplicarFiltros();
      return;
    }

    const terminoLower = this.busqueda.termino.toLowerCase().trim();
    
    // Filtramos los usuarios que coincidan con el término de búsqueda
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombreCompleto = `${usuario.primerNombre} ${usuario.segundoNombre || ''} ${usuario.primerApellido} ${usuario.segundoApellido || ''}`.toLowerCase();
      return nombreCompleto.includes(terminoLower) || 
             usuario.email.toLowerCase().includes(terminoLower) || 
             (usuario.telefono && usuario.telefono.includes(terminoLower));
    });
    
    // Reiniciamos la paginación
    this.paginaActual = 1;
  }

  /**
   * Aplicamos los filtros seleccionados
   */
  aplicarFiltros(): void {
    // Primero aplicamos la búsqueda por texto si existe
    if (this.busqueda.termino && this.busqueda.termino.trim() !== '') {
      this.aplicarBusqueda();
      return;
    }
    
    // Si no hay búsqueda por texto, filtramos por los otros criterios
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      let cumpleFiltroPrograma = true;
      let cumpleFiltroDeporte = true;
      let cumpleFiltroRutina = true;
      
      if (this.filtros.programa) {
        cumpleFiltroPrograma = usuario.programa === this.filtros.programa;
      }
      
      if (this.filtros.deporteId) {
        cumpleFiltroDeporte = usuario.deporteId?.toString() === this.filtros.deporteId;
      }
      
      if (this.filtros.tieneRutina !== null) {
        cumpleFiltroRutina = usuario.tieneRutina === this.filtros.tieneRutina;
      }
      
      return cumpleFiltroPrograma && cumpleFiltroDeporte && cumpleFiltroRutina;
    });
    
    // Reiniciamos la paginación
    this.paginaActual = 1;
  }

  /**
   * Resetea todos los filtros
   */
  resetearFiltros(): void {
    this.filtros = {
      programa: '',
      deporteId: '',
      tieneRutina: null
    };
    
    this.busqueda.termino = '';
    
    // Mostramos todos los usuarios
    this.usuariosFiltrados = [...this.usuarios];
    
    // Reiniciamos la paginación
    this.paginaActual = 1;
  }

  /**
   * Navega a una página específica
   */
  irAPagina(pagina: number): void {
    if (pagina < 1) {
      pagina = 1;
    }
    
    const totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.resultadosPorPagina);
    
    if (pagina > totalPaginas) {
      pagina = totalPaginas;
    }
    
    this.paginaActual = pagina;
  }

  /**
   * Controlador para mostrar/ocultar los detalles de un usuario
   */
  toggleDetalleUsuario(usuario: Usuario): void {
    this.detallesVisibles[usuario.id] = !this.detallesVisibles[usuario.id];
  }

  /**
   * Verifica si los detalles de un usuario están visibles
   */
  esDetalleVisible(usuarioId: number): boolean {
    return this.detallesVisibles[usuarioId] === true;
  }

  /**
   * Muestra el modal para editar un usuario
   */
  mostrarModalEditarUsuario(usuario: Usuario): void {
    console.log('Mostrando modal para editar usuario:', usuario);
    this.usuarioSeleccionado = usuario;
    this.abrirModalEditarUsuario(usuario);
  }

  /**
   * Muestra un modal utilizando Bootstrap
   */
  mostrarModal(modalId: string): void {
    console.log(`Intentando mostrar modal: ${modalId}`);
    
    if (!this.isBrowser) {
      console.log('No estamos en el navegador, no se puede mostrar el modal');
      return;
    }
    
    // Verificar si Bootstrap está cargado
    if (!bootstrap) {
      console.log('Bootstrap no está cargado, intentando cargar y reintentando...');
      this.cargarBootstrap();
      // Reintentar después de un tiempo para dar tiempo a que Bootstrap se cargue
      setTimeout(() => this.mostrarModalConTimeout(modalId), 500);
      return;
    }
    
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.error(`No se encontró el elemento modal con id ${modalId}`);
        return;
      }
      
      console.log(`Elemento modal encontrado: ${modalId}`);
      const modal = new bootstrap.Modal(modalElement);
      console.log(`Modal inicializado para ${modalId}`);
      modal.show();
      console.log(`Modal mostrado: ${modalId}`);
    } catch (error) {
      console.error('Error al mostrar el modal:', error);
      // Reintentar una vez más si hay un error
      setTimeout(() => this.mostrarModalConTimeout(modalId), 500);
    }
  }

  /**
   * Método auxiliar para mostrar un modal después de un retraso
   */
  mostrarModalConTimeout(modalId: string): void {
    try {
      console.log(`Reintentando mostrar modal: ${modalId}`);
      if (!bootstrap) {
        console.log('Bootstrap sigue sin estar disponible después del reintento');
        // Último intento: cargar bootstrap en modo jQuery
        import('bootstrap').then(bs => {
          bootstrap = bs;
          console.log('Bootstrap cargado en modo de emergencia');
          this.mostrarModal(modalId);
        }).catch(err => {
          console.error('Error al cargar Bootstrap en modo de emergencia:', err);
        });
        return;
      }
      
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.error(`No se encontró el elemento modal con id ${modalId} (reintento)`);
        return;
      }
      
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      console.log(`Modal mostrado en reintento: ${modalId}`);
    } catch (error) {
      console.error('Error al mostrar el modal (reintento):', error);
    }
  }

  /**
   * Oculta un modal utilizando Bootstrap
   */
  ocultarModal(modalId: string): void {
    console.log(`Ocultando modal: ${modalId}`);
    
    if (!this.isBrowser || !bootstrap) {
      console.log('No podemos ocultar el modal: no estamos en el navegador o Bootstrap no está cargado');
      return;
    }
    
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.error(`No se encontró el elemento modal con id ${modalId} para ocultar`);
        return;
      }
      
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
        console.log(`Modal ocultado: ${modalId}`);
      } else {
        console.error(`No se pudo obtener la instancia del modal ${modalId}`);
      }
    } catch (error) {
      console.error('Error al ocultar el modal:', error);
    }
  }

  /**
   * Muestra el modal para crear un usuario
   */
  mostrarModalCrearUsuario(): void {
    this.mostrarModal('crearUsuarioModal');
  }

  /**
   * Oculta el modal de edición de usuario
   */
  ocultarModalEditarUsuario(): void {
    this.ocultarModal('editarUsuarioModal');
  }

  /**
   * Confirma la desactivación de un usuario
   */
  confirmarDesactivarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModal('eliminarUsuarioModal');
  }

  /**
   * Desactiva un usuario
   */
  desactivarUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    
    this.cargando = true;
    
    this.databaseService.desactivarUsuario(this.usuarioSeleccionado.id).subscribe({
      next: (response) => {
        console.log('Usuario desactivado correctamente:', response);
        
        // Cerrar el modal
        this.ocultarModal('eliminarUsuarioModal');
        
        // Recargar la lista de usuarios
        this.cargarUsuarios();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al desactivar usuario:', error);
        alert('Error al desactivar usuario. Por favor, inténtelo de nuevo.');
        this.cargando = false;
      }
    });
  }

  /**
   * Muestra el modal para crear una rutina
   */
  mostrarModalCrearRutina(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.modalCrearRutinaVisible = true;
    this.mostrarModal('crearRutinaModal');
  }

  /**
   * Oculta el modal de creación de rutina
   */
  ocultarModalCrearRutina(): void {
    this.ocultarModal('crearRutinaModal');
  }

  /**
   * Muestra el modal para editar una rutina
   */
  mostrarModalEditarRutina(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.rutinaSeleccionadaId = 0; // Aquí deberíamos obtener el ID de la rutina actual
    this.mostrarModal('editarRutinaModal');
  }

  /**
   * Oculta el modal de edición de rutina
   */
  ocultarModalEditarRutina(): void {
    this.ocultarModal('editarRutinaModal');
  }

  /**
   * Muestra el modal para ver una rutina
   */
  mostrarModalVerRutina(usuario: Usuario, rutinaId: number): void {
    this.usuarioSeleccionado = usuario;
    this.rutinaSeleccionadaId = rutinaId;
    this.mostrarModal('verRutinaModal');
  }

  /**
   * Oculta el modal de visualización de rutina
   */
  ocultarModalVerRutina(): void {
    this.ocultarModal('verRutinaModal');
  }

  /**
   * Muestra el modal de historial de rutinas
   */
  mostrarModalHistorialRutinas(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.modalHistorialRutinasVisible = true;
  }

  /**
   * Oculta el modal de historial de rutinas
   */
  ocultarModalHistorialRutinas(): void {
    this.modalHistorialRutinasVisible = false;
  }

  /**
   * Actualiza la lista de usuarios después de crear uno nuevo
   */
  actualizarListaUsuarios(event: any): void {
    console.log('Usuario creado:', event);
    this.cargarUsuarios();
    
    // Cerrar el modal
    this.ocultarModal('crearUsuarioModal');
  }

  /**
   * Guarda los cambios del usuario editado
   */
  guardarUsuario(): void {
    this.guardarCambiosUsuario();
  }
}

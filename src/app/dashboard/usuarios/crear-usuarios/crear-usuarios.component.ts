import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import { finalize } from 'rxjs/operators'; // Importar finalize de RxJS

declare var bootstrap: any;

@Component({
  selector: 'app-crear-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-usuarios.component.html',
  styleUrls: ['./crear-usuarios.component.css']
})
export class CrearUsuariosComponent implements OnInit {
  // Formulario para crear usuario
  usuarioForm!: FormGroup; // Usar el operador ! para indicar que será inicializado en ngOnInit
  
  // Estado del formulario
  submitted = false;
  isLoading = false;
  errorMessage = '';
  showError = false; // Nueva propiedad para controlar la visibilidad del error
  
  // Modo edición
  @Input() modoEdicion: boolean = false;
  @Input() usuarioParaEditar: any = null;
  
  // Lista de deportes disponibles
  @Input() deportes: any[] = [];
  
  // Lista de posiciones disponibles para el deporte seleccionado
  posiciones: any[] = [];
  
  // Archivos de documentos
  documentos = {
    contrato: null as File | null,
    consentimiento: null as File | null,
    motivacion: null as File | null,
    evaluacion: null as File | null,
    otros: null as File | null
  };
  
  // Nombres de archivos para mostrar
  nombresArchivos = {
    contrato: '',
    consentimiento: '',
    motivacion: '',
    evaluacion: '',
    otros: ''
  };
  
  // Evento para notificar al componente padre
  @Output() usuarioCreado = new EventEmitter<any>();
  @Output() usuarioEditado = new EventEmitter<any>();
  
  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) {
    // Inicializar el formulario siguiendo las prácticas recomendadas para atributos disabled
    this.initForm();
  }
  
  ngOnInit(): void {
    // Inicializar el formulario siempre primero
    this.initForm();
    
    // Cargar deportes desde la API
    this.cargarDeportes();
    
    // Suscribirse a los cambios del control de deporte para cargar posiciones
    this.usuarioForm.get('deporte')?.valueChanges.subscribe(deporteId => {
      // Desactivar el control de posición si no hay deporte seleccionado
      if (!deporteId) {
        this.usuarioForm.get('posicion')?.disable();
        this.usuarioForm.get('posicion')?.setValue('');
        this.posiciones = [];
      } else {
        // Activar el control de posición y cargar las posiciones para este deporte
        this.usuarioForm.get('posicion')?.enable();
        this.cargarPosicionesPorDeporte(deporteId);
      }
    });
    
    // Inicialmente desactivar el control de posición
    this.usuarioForm.get('posicion')?.disable();
    
    // Si estamos en modo edición, cargar los datos del usuario
    if (this.modoEdicion && this.usuarioParaEditar) {
      this.cargarDatosUsuario();
    }
    
    // Si no hay deportes cargados, cargarlos directamente
    if (!this.deportes || this.deportes.length === 0) {
      this.cargarDeportes();
    } else {
      console.log('Deportes recibidos desde el componente padre:', this.deportes);
    }
  }
  
  // Inicializar el formulario con los controles necesarios
  initForm(): void {
    this.usuarioForm = this.fb.group({
      primerNombre: [{value: '', disabled: false}, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundoNombre: [{value: '', disabled: false}, [Validators.maxLength(50)]],
      primerApellido: [{value: '', disabled: false}, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundoApellido: [{value: '', disabled: false}, [Validators.maxLength(50)]],
      telefono: [{value: '', disabled: false}, [Validators.required, Validators.pattern(/^[0-9\-\+\s\(\)]{7,15}$/)]],
      email: [{value: '', disabled: false}, [Validators.required, Validators.email]],
      programa: [{value: '', disabled: false}, [Validators.required]],
      deporte: [{value: '', disabled: false}],
      posicion: [{value: '', disabled: true}], // Inicialmente deshabilitado
      lesiones: [{value: '', disabled: false}],
      dob: [{value: '', disabled: false}, [Validators.required]]
    });
  }
  
  // Método para cargar los deportes directamente desde el servicio
  cargarDeportes(): void {
    this.usuarioForm.get('deporte')?.disable(); // Deshabilitar mientras carga
    this.isLoading = true;
    
    this.databaseService.getDeportes().pipe(
      // Operador finalize para siempre habilitar el control cuando termine, sin importar si hay error o éxito
      finalize(() => {
        this.usuarioForm.get('deporte')?.enable();
        this.isLoading = false;
      })
    ).subscribe({
      next: (deportes: any[]) => {
        if (Array.isArray(deportes) && deportes.length > 0) {
          this.deportes = deportes;
        } else {
          this.cargarDeportesPreconfigurados();
        }
      },
      error: () => {
        this.cargarDeportesPreconfigurados();
      }
    });
  }
  
  // Método para cargar deportes predeterminados en caso de error
  cargarDeportesPreconfigurados(): void {
    this.deportes = [
      { id: 1, nombre: 'Fútbol' },
      { id: 2, nombre: 'Baloncesto' },
      { id: 3, nombre: 'Voleibol' },
      { id: 4, nombre: 'Natación' },
      { id: 5, nombre: 'Atletismo' },
      { id: 6, nombre: 'Tenis' },
      { id: 7, nombre: 'Fútbol Americano' },
      { id: 8, nombre: 'Béisbol' },
      { id: 9, nombre: 'Rugby' }
    ];
    
    // Resetear el campo deporte del formulario si tiene un valor
    const deporteControl = this.usuarioForm.get('deporte');
    if (deporteControl?.value) {
      deporteControl.reset('');
    }
  }
  
  // Método para cargar posiciones por deporte
  cargarPosicionesPorDeporte(deporteId: number): void {
    if (!deporteId) {
      this.posiciones = [];
      return;
    }
    
    this.isLoading = true;
    this.usuarioForm.get('posicion')?.disable(); // Deshabilitar mientras carga
    
    this.databaseService.obtenerPosicionesPorDeporte(deporteId).pipe(
      finalize(() => {
        this.usuarioForm.get('posicion')?.enable();
        this.isLoading = false;
      })
    ).subscribe({
      next: (posiciones: any[]) => {
        if (Array.isArray(posiciones)) {
          this.posiciones = posiciones;
        } else {
          this.cargarPosicionesPreconfiguradas(deporteId);
        }
      },
      error: () => {
        this.cargarPosicionesPreconfiguradas(deporteId);
      }
    });
  }
  
  // Método para cargar posiciones predeterminadas según el deporte
  cargarPosicionesPreconfiguradas(deporteId: number): void {
    // Buscar el nombre del deporte para cargar las posiciones adecuadas
    const deporteSeleccionado = this.deportes.find(d => d.id === deporteId);
    const nombreDeporte = deporteSeleccionado?.nombre || '';
    
    const posicionesPorDeporte: { [key: string]: Array<{id: number, nombre: string}> } = {
      'Fútbol': [
        { id: 101, nombre: 'Portero' },
        { id: 102, nombre: 'Defensa Central' },
        { id: 103, nombre: 'Lateral Derecho' },
        { id: 104, nombre: 'Lateral Izquierdo' },
        { id: 105, nombre: 'Mediocentro' },
        { id: 106, nombre: 'Centrocampista Ofensivo' },
        { id: 107, nombre: 'Extremo Derecho' },
        { id: 108, nombre: 'Extremo Izquierdo' },
        { id: 109, nombre: 'Delantero Centro' }
      ],
      'Baloncesto': [
        { id: 201, nombre: 'Base' },
        { id: 202, nombre: 'Escolta' },
        { id: 203, nombre: 'Alero' },
        { id: 204, nombre: 'Ala-Pívot' },
        { id: 205, nombre: 'Pívot' }
      ],
      'Voleibol': [
        { id: 301, nombre: 'Colocador' },
        { id: 302, nombre: 'Opuesto' },
        { id: 303, nombre: 'Central' },
        { id: 304, nombre: 'Receptor' },
        { id: 305, nombre: 'Líbero' }
      ],
      'Natación': [
        { id: 401, nombre: 'Estilo Libre' },
        { id: 402, nombre: 'Mariposa' },
        { id: 403, nombre: 'Espalda' },
        { id: 404, nombre: 'Pecho' },
        { id: 405, nombre: 'Combinado' }
      ]
    };
    
    // Buscar posiciones para el deporte seleccionado o asignar array vacío
    this.posiciones = nombreDeporte && posicionesPorDeporte[nombreDeporte] ? 
                     posicionesPorDeporte[nombreDeporte] : 
                     [];
    
    // Resetear el campo posición del formulario si tiene un valor
    const posicionControl = this.usuarioForm.get('posicion');
    if (posicionControl?.value) {
      posicionControl.reset('');
    }
  }
  
  // Getter para acceder fácilmente a los controles del formulario
  get f() { 
    return this.usuarioForm.controls; 
  }
  
  // Método para cargar los datos del usuario en el formulario
  cargarDatosUsuario(): void {
    if (!this.usuarioParaEditar) return;
    
    // Llenar el formulario con los datos del usuario
    this.usuarioForm.patchValue({
      primerNombre: this.usuarioParaEditar.primerNombre,
      segundoNombre: this.usuarioParaEditar.segundoNombre || '',
      primerApellido: this.usuarioParaEditar.primerApellido,
      segundoApellido: this.usuarioParaEditar.segundoApellido || '',
      telefono: this.usuarioParaEditar.telefono,
      email: this.usuarioParaEditar.email,
      programa: this.usuarioParaEditar.programa,
      deporte: this.usuarioParaEditar.deporte || '',
      posicion: this.usuarioParaEditar.posicion || '',
      lesiones: this.usuarioParaEditar.lesiones || '',
      dob: this.usuarioParaEditar.dob || ''
    });
    
    // No cargamos los documentos porque son archivos y no se pueden editar de esta manera
  }
  
  // Método para manejar la selección de archivos
  onDocumentoSeleccionado(event: Event, tipo: 'contrato' | 'consentimiento' | 'motivacion' | 'evaluacion' | 'otros'): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      
      // Verificar que sea un archivo PDF
      if (archivo.type === 'application/pdf') {
        this.documentos[tipo] = archivo;
        this.nombresArchivos[tipo] = archivo.name;
      } else {
        // Resetear si no es un PDF
        this.documentos[tipo] = null;
        this.nombresArchivos[tipo] = '';
        alert('Por favor, seleccione un archivo PDF válido.');
        input.value = '';
      }
    }
  }
  
  // Método para cerrar correctamente el modal
  cerrarModal(): void {
    // Resetear el formulario primero
    this.resetForm();
    
    // Usar la API de Bootstrap para cerrar el modal
    const modalElement = document.getElementById('crearUsuarioModal');
    if (modalElement) {
      try {
        // Intentar obtener la instancia del modal
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      } catch (error) {
        console.error('Error al cerrar el modal:', error);
      }
    }
    
    // Limpiar manualmente los elementos del modal
    this.limpiarElementosModal();
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
  
  // Método para enviar el formulario
  onSubmit(): void {
    this.submitted = true;
    this.showError = false;
    
    // Detener si el formulario no es válido
    if (!this.usuarioForm.valid) {
      return;
    }
    
    this.isLoading = true;
    const formValues = this.usuarioForm.getRawValue();
    
    // Obtener los nombres del deporte y posición seleccionados
    const deporteSeleccionado = this.deportes.find(d => d.id === Number(formValues.deporte));
    const posicionSeleccionada = this.posiciones.find(p => p.id === Number(formValues.posicion));
    formValues.nombreDeporte = deporteSeleccionado?.nombre || '';
    formValues.nombrePosicion = posicionSeleccionada?.nombre || '';
    
    // Si es edición, usar el ID existente
    if (this.modoEdicion && this.usuarioParaEditar) {
      formValues.id = this.usuarioParaEditar.id;
      
      this.databaseService.updateUsuario(this.usuarioParaEditar.id, formValues).subscribe({
        next: (response) => {
          const usuarioActualizado = this.crearObjetoUsuario(formValues, this.usuarioParaEditar.id);
          this.usuarioEditado.emit(usuarioActualizado);
          this.resetForm();
          this.cerrarModal();
          this.isLoading = false;
        },
        error: (error) => this.manejarError(error)
      });
    } else {
      // Verificar primero si el servidor API está disponible
      this.checkServerConnection().then(isConnected => {
        if (!isConnected) {
          this.manejarModoSinConexion(formValues);
          return;
        }
        
        // Registrar el usuario en la base de datos
        this.databaseService.createUsuario(formValues).subscribe({
          next: (response) => {
            try {
              // Obtener ID de la respuesta o generar uno temporal
              const userId = response?.data?.id || response?.id || Date.now();
              
              const usuarioCreado = this.crearObjetoUsuario(formValues, userId);
              
              // Emitir evento con el nuevo usuario
              this.usuarioCreado.emit(usuarioCreado);
              
              // Limpiar el formulario y cerrar el modal
              this.resetForm();
              this.cerrarModal();
            } catch (err) {
              console.error('Error al procesar la respuesta del servidor:', err);
              this.errorMessage = 'Error al procesar la respuesta. Por favor, inténtelo de nuevo.';
              this.showError = true;
            }
            
            this.isLoading = false;
          },
          error: (error) => this.manejarError(error)
        });
      }).catch(() => {
        this.errorMessage = 'No se puede verificar la conectividad del servidor. Por favor, inténtelo de nuevo más tarde.';
        this.showError = true;
        this.isLoading = false;
      });
    }
  }
  
  // Método para manejar errores de peticiones HTTP
  private manejarError(error: any): void {
    console.error('Error al gestionar usuario:', error);
    
    if (error.error?.error === 'EMAIL_EXISTS') {
      this.errorMessage = 'Ya existe un usuario con este correo electrónico. Por favor, utilice otro correo.';
    } else if (error.status === 422) {
      this.errorMessage = 'El formato de los datos no es válido. Por favor, revise la información ingresada.';
    } else if (error.status === 0) {
      this.errorMessage = 'No se puede conectar al servidor. Por favor, asegúrese de que el servidor API esté en ejecución.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error en el servidor. Por favor, inténtelo de nuevo más tarde.';
    } else {
      this.errorMessage = error.error?.message || error.message || 'Error al gestionar usuario. Inténtelo de nuevo.';
    }
    
    this.showError = true;
    this.isLoading = false;
  }
  
  // Método para manejar la creación en modo sin conexión
  private manejarModoSinConexion(formValues: any): void {
    this.isLoading = false;
    this.errorMessage = 'No se puede conectar al servidor. Por favor, asegúrese de que el servidor API esté en ejecución.';
    this.showError = true;
    
    if (confirm('No se ha podido conectar al servidor. ¿Desea crear este usuario en modo sin conexión? (Los datos no se guardarán en el servidor)')) {
      const usuarioOffline = this.crearObjetoUsuario(formValues, Date.now(), true);
      
      this.usuarioCreado.emit(usuarioOffline);
      alert('Usuario creado en modo sin conexión. Los datos no se han guardado en el servidor.');
      this.resetForm();
      this.cerrarModal();
    }
  }
  
  // Método para crear un objeto de usuario a partir de los valores del formulario
  private crearObjetoUsuario(formValues: any, userId: number, modoOffline: boolean = false): any {
    return {
      id: userId,
      primerNombre: formValues.primerNombre,
      segundoNombre: formValues.segundoNombre || '',
      primerApellido: formValues.primerApellido,
      segundoApellido: formValues.segundoApellido || '',
      telefono: formValues.telefono,
      email: formValues.email,
      tieneRutina: modoOffline ? false : (this.modoEdicion ? this.usuarioParaEditar.tieneRutina : false),
      tieneHistorialRutinas: modoOffline ? false : (this.modoEdicion ? this.usuarioParaEditar.tieneHistorialRutinas : false),
      programa: formValues.programa,
      deporte: formValues.nombreDeporte || formValues.deporte || '',
      deporteId: Number(formValues.deporte) || null,
      deporteNombre: formValues.nombreDeporte || '',
      posicion: formValues.nombrePosicion || formValues.posicion || '',
      posicionId: Number(formValues.posicion) || null,
      posicionNombre: formValues.nombrePosicion || '',
      lesiones: formValues.lesiones || '',
      dob: formValues.dob,
      documentos: {
        contrato: this.generarUrlSimulada('contrato'),
        consentimiento: this.generarUrlSimulada('consentimiento'),
        motivacion: this.generarUrlSimulada('motivacion'),
        evaluacion: this.generarUrlSimulada('evaluacion'),
        otros: this.generarUrlSimulada('otros')
      },
      mostrarDetalles: false,
      ...(modoOffline && { modoOffline: true })
    };
  }
  
  // Método para verificar la conexión al servidor antes de intentar guardar
  private async checkServerConnection(): Promise<boolean> {
    try {
      // Hacer una petición simple para verificar si el servidor está disponible
      await fetch('http://localhost:3000/api/test-connection', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Timeout de 3 segundos para no esperar demasiado
        signal: AbortSignal.timeout(3000)
      });
      return true;
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      return false;
    }
  }
  
  // Método para resetear el formulario
  resetForm(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.showError = false; // Resetear estado de error
    this.usuarioForm.reset();
    
    // Resetear los documentos
    Object.keys(this.documentos).forEach(key => {
      const tipoKey = key as keyof typeof this.documentos;
      this.documentos[tipoKey] = null;
      this.nombresArchivos[tipoKey as keyof typeof this.nombresArchivos] = '';
    });
    
    // Resetear los elementos de archivo
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: Element) => {
      (input as HTMLInputElement).value = '';
    });
  }
  
  // Método para generar URLs simuladas para los documentos
  private generarUrlSimulada(tipo: string): string {
    const documento = this.documentos[tipo as keyof typeof this.documentos];
    if (!documento) return '';
    
    // En una aplicación real, aquí se subirían los archivos a un servidor
    // y se devolvería la URL real. Por ahora, simulamos una URL.
    return `documentos/${tipo}_${Date.now()}.pdf`;
  }
}

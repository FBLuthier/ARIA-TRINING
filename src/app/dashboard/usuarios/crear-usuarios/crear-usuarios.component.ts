import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  usuarioForm: FormGroup;
  
  // Estado del formulario
  submitted = false;
  
  // Modo edición
  @Input() modoEdicion: boolean = false;
  @Input() usuarioParaEditar: any = null;
  
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
  
  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      primerNombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundoNombre: ['', [Validators.maxLength(50)]],
      primerApellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundoApellido: ['', [Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s\(\)]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      programa: ['', [Validators.required]],
      deporte: [''],
      posicion: [''],
      lesiones: [''],
      dob: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    // Si estamos en modo edición, cargar los datos del usuario
    if (this.modoEdicion && this.usuarioParaEditar) {
      this.cargarDatosUsuario();
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
    
    // Detener si el formulario es inválido
    if (this.usuarioForm.invalid) {
      return;
    }
    
    // Crear objeto de usuario con los datos del formulario
    const nuevoUsuario = {
      id: this.modoEdicion && this.usuarioParaEditar ? this.usuarioParaEditar.id : Math.floor(Math.random() * 1000),
      ...this.usuarioForm.value,
      tieneRutina: this.modoEdicion && this.usuarioParaEditar ? this.usuarioParaEditar.tieneRutina : false,
      documentos: this.modoEdicion && this.usuarioParaEditar ? this.usuarioParaEditar.documentos : {
        contrato: '',
        consentimiento: '',
        motivacion: '',
        evaluacion: '',
        otros: ''
      }
    };
    
    // Emitir evento con el nuevo usuario
    if (this.modoEdicion) {
      this.usuarioEditado.emit(nuevoUsuario);
    } else {
      this.usuarioCreado.emit(nuevoUsuario);
    }
    
    // Limpiar el formulario y cerrar el modal
    this.resetForm();
    this.cerrarModal();
    
    // Mostrar mensaje de éxito (en producción, esto se haría después de confirmar desde el backend)
    console.log('Usuario guardado exitosamente:', nuevoUsuario);
  }
  
  // Método para generar URLs simuladas para los documentos
  private generarUrlSimulada(tipo: string): string {
    const nombreBase = `${this.usuarioForm.value.primerNombre.toLowerCase()}_${this.usuarioForm.value.primerApellido.toLowerCase()}`;
    return `documentos/${tipo}_${nombreBase}.pdf`;
  }
  
  // Método para reiniciar el formulario
  resetForm(): void {
    this.submitted = false;
    this.usuarioForm.reset();
    
    // Resetear los documentos
    this.documentos = {
      contrato: null,
      consentimiento: null,
      motivacion: null,
      evaluacion: null,
      otros: null
    };
    
    // Resetear los nombres de archivos
    this.nombresArchivos = {
      contrato: '',
      consentimiento: '',
      motivacion: '',
      evaluacion: '',
      otros: ''
    };
  }
}

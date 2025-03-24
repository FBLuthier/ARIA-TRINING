import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SafePipe } from '../../../shared/pipes/safe.pipe';

// Interfaces locales para no depender de los modelos externos
interface Fase {
  id: number;
  nombre: string;
  indicaciones?: string;
  expandido?: boolean;
  ejercicios: any[];
}

interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  faseId: number;
  mostrarVideo?: boolean;
}

@Component({
  selector: 'app-crear-ejercicios',
  templateUrl: './crear-ejercicios.component.html',
  styleUrls: ['./crear-ejercicios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafePipe]
})
export class CrearEjerciciosComponent implements OnInit {
  @Input() fases: Fase[] = [
    { id: 1, nombre: 'Activación 1', ejercicios: [] },
    { id: 2, nombre: 'Activación 2', ejercicios: [] },
    { id: 3, nombre: 'Potenciación', ejercicios: [] },
    { id: 4, nombre: 'Específico', ejercicios: [] },
    { id: 5, nombre: 'Metabólico', ejercicios: [] },
    { id: 6, nombre: 'Fuerza', ejercicios: [] },
    { id: 7, nombre: 'Reset', ejercicios: [] },
    { id: 8, nombre: 'Otros', ejercicios: [] }
  ];
  @Input() modoEdicion: boolean = false;
  @Input() ejercicioParaEditar: Ejercicio | null = null;
  @Input() faseSeleccionadaInicial: Fase | null = null;
  
  @Output() ejercicioCreado = new EventEmitter<Ejercicio>();
  @Output() ejercicioEditado = new EventEmitter<Ejercicio>();
  
  ejercicioForm!: FormGroup;
  faseSeleccionada: Fase | null = null;
  submitted = false;
  
  constructor(private fb: FormBuilder) {
  }
  
  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Si estamos en modo edición, cargar los datos del ejercicio
    if (this.modoEdicion && this.ejercicioParaEditar) {
      this.cargarDatosEjercicio();
    }
    
    // Si tenemos una fase seleccionada inicial, usarla
    if (this.faseSeleccionadaInicial) {
      this.faseSeleccionada = this.faseSeleccionadaInicial;
    }
  }
  
  // Método para cargar los datos del ejercicio en el formulario
  cargarDatosEjercicio(): void {
    if (!this.ejercicioParaEditar) return;
    
    // Buscar la fase a la que pertenece el ejercicio
    const fase = this.fases.find(f => f.id === this.ejercicioParaEditar?.faseId);
    if (fase) {
      this.faseSeleccionada = fase;
    }
    
    // Llenar el formulario con los datos del ejercicio
    this.ejercicioForm.patchValue({
      nombre: this.ejercicioParaEditar.nombre,
      camara: this.ejercicioParaEditar.camara,
      indicaciones: this.ejercicioParaEditar.indicaciones,
      videoUrl: this.ejercicioParaEditar.videoUrl || ''
    });
  }
  
  // Getter para acceder fácilmente a los controles del formulario
  get f() { return this.ejercicioForm.controls; }
  
  // Método para seleccionar una fase
  seleccionarFase(fase: Fase): void {
    this.faseSeleccionada = fase;
  }
  
  // Procesar URL de YouTube para convertirla en formato embed
  procesarUrlYoutube(url: string): string {
    if (!url || url.trim() === '') {
      return '';
    }
    
    // Intentar extraer el ID del video de YouTube de diferentes formatos de URL
    let videoId = '';
    
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    const regExp1 = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match1 = url.match(regExp1);
    
    if (match1 && match1[2].length === 11) {
      videoId = match1[2];
    } else {
      // Formato: https://youtu.be/VIDEO_ID
      const regExp2 = /^(https?:\/\/)?(www\.)?(youtu\.be\/|youtube\.com\/)(embed\/|v\/|watch\?v=|watch\?.+&v=)?((\w|-){11})(\S+)?$/;
      const match2 = url.match(regExp2);
      
      if (match2 && match2[5]) {
        videoId = match2[5];
      } else {
        // Si no se encuentra un ID válido, devolver la URL original
        return url;
      }
    }
    
    // Construir la URL de embed con el ID del video
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Método para enviar el formulario
  onSubmit(): void {
    this.submitted = true;
    
    // Detener si el formulario es inválido o no se ha seleccionado una fase
    if (this.ejercicioForm.invalid || !this.faseSeleccionada) {
      return;
    }
    
    // Obtener la URL del video y procesarla si existe
    const rawVideoUrl = this.ejercicioForm.value.videoUrl;
    const videoUrl = rawVideoUrl && rawVideoUrl.trim() !== '' 
      ? this.procesarUrlYoutube(rawVideoUrl)
      : '';
    
    // Crear objeto de ejercicio con los datos del formulario
    const nuevoEjercicio: Ejercicio = {
      id: this.modoEdicion && this.ejercicioParaEditar ? this.ejercicioParaEditar.id : Math.floor(Math.random() * 1000),
      nombre: this.ejercicioForm.value.nombre,
      camara: this.ejercicioForm.value.camara,
      indicaciones: this.ejercicioForm.value.indicaciones,
      videoUrl: videoUrl,
      faseId: this.faseSeleccionada ? this.faseSeleccionada.id : 0
    };
    
    // Emitir evento con el nuevo ejercicio
    if (this.modoEdicion) {
      this.ejercicioEditado.emit(nuevoEjercicio);
    } else {
      this.ejercicioCreado.emit(nuevoEjercicio);
    }
    
    // Limpiar el formulario y cerrar el modal
    this.resetForm();
    this.cerrarModal();
    
    // Mostrar mensaje de éxito (en producción, esto se haría después de confirmar desde el backend)
    console.log('Ejercicio creado exitosamente:', nuevoEjercicio);
  }
  
  // Método para cerrar correctamente el modal
  cerrarModal(): void {
    // Resetear el formulario primero
    this.resetForm();
    
    // Asegurarse de que el modal esté oculto
    const modalElement = document.getElementById('crearEjercicioModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
    }
    
    // Eliminar el backdrop del modal
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
    
    // Permitir scroll en el body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  
  // Método para resetear el formulario
  resetForm(): void {
    this.submitted = false;
    this.ejercicioForm.reset();
    this.faseSeleccionada = null;
  }
  
  // Método para inicializar el formulario
  inicializarFormulario(): void {
    this.ejercicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      camara: ['', Validators.required],
      indicaciones: ['', Validators.required],
      videoUrl: ['']
    });
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SafePipe]
})
export class CrearEjerciciosComponent implements OnInit {
  @Input() modoEdicion: boolean = false;
  @Input() ejercicioParaEditar: Ejercicio | null = null;
  @Output() ejercicioEditado = new EventEmitter<Ejercicio>();
  
  fases: Fase[] = [
    { id: 1, nombre: 'Activación 1', ejercicios: [] },
    { id: 2, nombre: 'Activación 2', ejercicios: [] },
    { id: 3, nombre: 'Potenciación', ejercicios: [] },
    { id: 4, nombre: 'Core', ejercicios: [] },
    { id: 5, nombre: 'Fuerza principal', ejercicios: [] },
    { id: 6, nombre: 'Cardio', ejercicios: [] },
    { id: 7, nombre: 'Reset', ejercicios: [] },
    { id: 8, nombre: 'Otros', ejercicios: [] }
  ];
  
  faseSeleccionadaInicial: Fase | null = null;
  
  ejercicioForm!: FormGroup;
  faseSeleccionada: Fase | null = null;
  submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      // Si hay un ID de fase en los parámetros, seleccionar esa fase
      if (params['faseId']) {
        const faseId = Number(params['faseId']);
        const fase = this.fases.find(f => f.id === faseId);
        if (fase) {
          this.faseSeleccionada = fase;
        }
      }
      
      // Si hay un ID de ejercicio, estamos en modo edición
      if (params['id']) {
        this.modoEdicion = true;
        const ejercicioId = Number(params['id']);
        // Aquí normalmente harías una llamada al servicio para obtener los datos del ejercicio
        // Por ahora, simularemos que obtenemos los datos
        this.ejercicioParaEditar = {
          id: ejercicioId,
          nombre: 'Ejercicio de ejemplo',
          camara: 'Frontal',
          indicaciones: 'Indicaciones de ejemplo',
          faseId: this.faseSeleccionada ? this.faseSeleccionada.id : 1
        };
        this.cargarDatosEjercicio();
      }
    });
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
    
    // En un entorno real, aquí llamaríamos a un servicio para guardar los datos
    console.log('Ejercicio guardado:', nuevoEjercicio);
    
    // Si estamos en modo edición, emitir el evento con el ejercicio editado
    if (this.modoEdicion) {
      this.ejercicioEditado.emit(nuevoEjercicio);
    } else {
      // Mostrar mensaje de éxito y navegar de vuelta a la lista de ejercicios
      this.mostrarMensaje('Ejercicio creado correctamente', 'success');
      this.router.navigate(['/dashboard/ejercicios']);
    }
  }
  
  // Método para mostrar mensaje
  mostrarMensaje(mensaje: string, tipo: string): void {
    console.log(`Mensaje ${tipo}: ${mensaje}`);
    // Aquí implementaríamos un servicio de notificaciones
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

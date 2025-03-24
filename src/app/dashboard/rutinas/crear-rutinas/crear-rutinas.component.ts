import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Rutina, DiaRutina, FaseRutina, EjercicioRutina } from '../models/rutina.model';
import { RutinaService } from '../services/rutina.service';
import { EjercicioRutinaComponent } from '../ejercicio-rutina/ejercicio-rutina.component';
import { Usuario } from '../../usuarios/models/usuario.model';

@Component({
  selector: 'app-crear-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EjercicioRutinaComponent],
  templateUrl: './crear-rutinas.component.html',
  styleUrls: ['./crear-rutinas.component.css']
})
export class CrearRutinasComponent implements OnInit {
  @Input() usuarioId!: number;
  @Input() usuario: Usuario | null = null;
  @Input() rutina: Rutina | null = null;
  @Input() modoEdicion: boolean = true;
  
  @Output() rutinaGuardada = new EventEmitter<Rutina>();
  @Output() cancelar = new EventEmitter<void>();
  
  // Variables para el manejo de la interfaz
  diaSeleccionado: DiaRutina | number | null = null;
  faseSeleccionada: FaseRutina | number | null = null;
  ejercicioSeleccionado: EjercicioRutina | null = null;
  numeroDias: number = 1;
  
  // Modo de edición de ejercicio
  modoEdicionEjercicio: boolean = false;
  
  // Errores y mensajes
  error: string = '';
  mensaje: string = '';
  guardando: boolean = false;
  
  constructor(private rutinaService: RutinaService) {}
  
  ngOnInit(): void {
    // Si estamos en modo edición, no inicializamos la rutina automáticamente
    if (!this.modoEdicion || !this.rutina) {
      this.inicializarRutina();
    }
  }
  
  /**
   * Inicializa la rutina con valores por defecto si es necesario
   */
  inicializarRutina(): void {
    if (!this.rutina) {
      this.rutina = {
        id: 0,
        usuarioId: this.usuarioId,
        nombre: 'Nueva Rutina',
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        activa: true,
        dias: []
      };
      
      // Crear un día por defecto
      this.agregarDia();
    } else {
      this.numeroDias = this.rutina.dias.length;
    }
    
    // Seleccionar el primer día por defecto
    if (this.rutina.dias.length > 0) {
      this.seleccionarDia(this.rutina.dias[0]);
    }
  }
  
  /**
   * Agrega un nuevo día a la rutina
   */
  agregarDia(): void {
    if (!this.rutina) return;
    
    const nuevoDia: DiaRutina = {
      id: this.generarIdTemporal(),
      rutinaId: this.rutina.id,
      nombre: `Día ${this.rutina.dias.length + 1}`,
      orden: this.rutina.dias.length + 1,
      fases: []
    };
    
    this.rutina.dias.push(nuevoDia);
    this.seleccionarDia(nuevoDia);
    
    // Agregar una fase por defecto al nuevo día
    this.agregarFase();
  }
  
  /**
   * Agrega una nueva fase al día seleccionado
   */
  agregarFase(nombreFase?: string): void {
    if (this.diaSeleccionado === null) return;
    
    const dia = this.getDiaSeleccionado();
    if (!dia) return;
    
    const nuevaFase: FaseRutina = {
      id: this.generarIdTemporal(),
      diaRutinaId: dia.id,
      faseId: 0, // Valor por defecto para el ID de la fase
      nombre: nombreFase || `Fase ${dia.fases.length + 1}`,
      orden: dia.fases.length + 1,
      indicaciones: '',
      ejercicios: []
    };
    
    dia.fases.push(nuevaFase);
    
    if (nombreFase) {
      // Mostrar mensaje de éxito si se especificó un nombre
      this.mensaje = `Fase "${nombreFase}" agregada correctamente`;
      setTimeout(() => this.mensaje = '', 3000);
    } else {
      // Si no se especificó nombre, seleccionar la fase automáticamente
      this.seleccionarFase(nuevaFase);
    }
  }
  
  /**
   * Agrega un nuevo ejercicio a la fase seleccionada
   */
  agregarEjercicio(fase?: FaseRutina): void {
    // Si se proporciona una fase, la seleccionamos primero
    if (fase) {
      this.faseSeleccionada = fase;
    }
    
    if (this.faseSeleccionada === null) return;
    
    const faseActual = typeof this.faseSeleccionada === 'number' 
      ? this.getDiaSeleccionado()?.fases[this.faseSeleccionada] 
      : this.faseSeleccionada;
    
    if (!faseActual) return;
    
    const nuevoEjercicio: EjercicioRutina = {
      id: this.generarIdTemporal(),
      faseRutinaId: faseActual.id,
      ejercicioId: 0,
      nombre: 'Nuevo Ejercicio',
      numSeries: 3,
      numRepeticiones: 10,
      tempo: {
        tipo: 'subida-pausa-bajada',
        tiempos: [2, 1, 2]
      },
      descanso: {
        minutos: 1,
        segundos: 0
      },
      camara: '',
      indicaciones: '',
      correcciones: '',
      comentarios: '',
      videoUrl: '',
      videoEjecucionUrl: '',
      series: [],
      orden: faseActual.ejercicios.length + 1
    };
    
    // Inicializar series
    for (let i = 0; i < nuevoEjercicio.numSeries; i++) {
      nuevoEjercicio.series.push({
        id: this.generarIdTemporal(),
        ejercicioRutinaId: nuevoEjercicio.id,
        numero: i + 1,
        pesoObjetivo: 0,
        pesoRealizado: 0,
        repeticionesRealizadas: 0,
        completada: false
      });
    }
    
    faseActual.ejercicios.push(nuevoEjercicio);
    this.editarEjercicio(nuevoEjercicio);
  }
  
  /**
   * Selecciona un día de la rutina
   */
  seleccionarDia(dia: DiaRutina | number): void {
    this.diaSeleccionado = dia;
    
    const diaObj = typeof dia === 'number' ? this.rutina?.dias[dia] : dia;
    
    if (diaObj && diaObj.fases.length > 0) {
      this.seleccionarFase(diaObj.fases[0]);
    } else {
      this.faseSeleccionada = null;
    }
    
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Selecciona una fase del día
   */
  seleccionarFase(fase: FaseRutina | number): void {
    this.faseSeleccionada = fase;
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Edita un ejercicio
   */
  editarEjercicio(ejercicio: EjercicioRutina): void {
    this.ejercicioSeleccionado = ejercicio;
    this.modoEdicionEjercicio = true;
  }
  
  /**
   * Elimina un día de la rutina
   */
  eliminarDia(dia: DiaRutina): void {
    if (!this.rutina) return;
    
    const index = this.rutina.dias.findIndex(d => d.id === dia.id);
    if (index !== -1) {
      this.rutina.dias.splice(index, 1);
      
      // Reordenar los días
      this.rutina.dias.forEach((d, i) => {
        d.orden = i + 1;
      });
      
      // Seleccionar otro día si hay disponibles
      if (this.rutina.dias.length > 0) {
        this.seleccionarDia(this.rutina.dias[0]);
      } else {
        this.diaSeleccionado = null;
        this.faseSeleccionada = null;
        this.ejercicioSeleccionado = null;
      }
      
      // Actualizar el número de días
      this.numeroDias = this.rutina.dias.length;
    }
  }
  
  /**
   * Elimina una fase del día seleccionado
   */
  eliminarFase(fase: FaseRutina): void {
    const dia = this.getDiaSeleccionado();
    if (!dia) return;
    
    const index = dia.fases.findIndex(f => f.id === fase.id);
    if (index !== -1) {
      dia.fases.splice(index, 1);
      
      // Reordenar las fases
      dia.fases.forEach((f, i) => {
        f.orden = i + 1;
      });
      
      // Seleccionar otra fase si hay disponibles
      if (dia.fases.length > 0) {
        this.seleccionarFase(dia.fases[0]);
      } else {
        this.faseSeleccionada = null;
        this.ejercicioSeleccionado = null;
      }
    }
  }
  
  /**
   * Elimina un ejercicio de la fase seleccionada
   */
  eliminarEjercicio(ejercicio: EjercicioRutina): void {
    const fase = this.getFaseSeleccionada();
    if (!fase) return;
    
    const index = fase.ejercicios.findIndex(e => e.id === ejercicio.id);
    if (index !== -1) {
      fase.ejercicios.splice(index, 1);
      
      this.ejercicioSeleccionado = null;
      this.modoEdicionEjercicio = false;
    }
  }
  
  /**
   * Guarda los cambios en el ejercicio
   */
  guardarEjercicio(ejercicio: EjercicioRutina): void {
    const fase = this.getFaseSeleccionada();
    if (!fase) return;
    
    const index = fase.ejercicios.findIndex(e => e.id === ejercicio.id);
    if (index !== -1) {
      fase.ejercicios[index] = ejercicio;
    } else {
      fase.ejercicios.push(ejercicio);
    }
    
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Cancela la edición del ejercicio
   */
  cancelarEdicionEjercicio(): void {
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Mueve un día hacia arriba en el orden
   */
  moverDiaArriba(dia: DiaRutina): void {
    if (!this.rutina) return;
    
    const index = this.rutina.dias.findIndex(d => d.id === dia.id);
    if (index > 0) {
      // Intercambiar con el día anterior
      const temp = this.rutina.dias[index];
      this.rutina.dias[index] = this.rutina.dias[index - 1];
      this.rutina.dias[index - 1] = temp;
      
      // Actualizar órdenes
      this.actualizarOrdenDias();
    }
  }
  
  /**
   * Mueve un día hacia abajo en el orden
   */
  moverDiaAbajo(dia: DiaRutina): void {
    if (!this.rutina) return;
    
    const index = this.rutina.dias.findIndex(d => d.id === dia.id);
    if (index !== -1 && index < this.rutina.dias.length - 1) {
      // Intercambiar con el día siguiente
      const temp = this.rutina.dias[index];
      this.rutina.dias[index] = this.rutina.dias[index + 1];
      this.rutina.dias[index + 1] = temp;
      
      // Actualizar órdenes
      this.actualizarOrdenDias();
    }
  }
  
  /**
   * Actualiza el orden de los días
   */
  private actualizarOrdenDias(): void {
    if (!this.rutina) return;
    
    this.rutina.dias.forEach((dia, index) => {
      dia.orden = index + 1;
    });
  }
  
  /**
   * Clona un día existente
   */
  clonarDia(dia: DiaRutina): void {
    if (!this.rutina) return;
    
    // Crear una copia profunda del día
    const nuevoDia: DiaRutina = {
      id: this.generarIdTemporal(),
      rutinaId: this.rutina.id,
      nombre: `${dia.nombre} (Copia)`,
      orden: this.rutina.dias.length + 1,
      fases: []
    };
    
    // Clonar las fases
    dia.fases.forEach(fase => {
      const nuevaFase: FaseRutina = {
        id: this.generarIdTemporal(),
        diaRutinaId: nuevoDia.id,
        faseId: fase.faseId,
        nombre: fase.nombre,
        orden: fase.orden,
        indicaciones: fase.indicaciones,
        ejercicios: []
      };
      
      // Clonar los ejercicios
      fase.ejercicios.forEach(ejercicio => {
        const nuevoEjercicio: EjercicioRutina = {
          id: this.generarIdTemporal(),
          faseRutinaId: nuevaFase.id,
          ejercicioId: ejercicio.ejercicioId,
          nombre: ejercicio.nombre,
          numSeries: ejercicio.numSeries,
          numRepeticiones: ejercicio.numRepeticiones,
          tempo: { ...ejercicio.tempo },
          descanso: { ...ejercicio.descanso },
          camara: ejercicio.camara,
          indicaciones: ejercicio.indicaciones,
          correcciones: ejercicio.correcciones,
          comentarios: ejercicio.comentarios,
          videoUrl: ejercicio.videoUrl,
          videoEjecucionUrl: ejercicio.videoEjecucionUrl,
          series: [...ejercicio.series],
          orden: ejercicio.orden
        };
        
        nuevaFase.ejercicios.push(nuevoEjercicio);
      });
      
      nuevoDia.fases.push(nuevaFase);
    });
    
    // Agregar el nuevo día a la rutina
    this.rutina.dias.push(nuevoDia);
    
    // Seleccionar el nuevo día
    this.seleccionarDia(nuevoDia);
  }
  
  /**
   * Guarda la rutina
   */
  guardarRutina(): void {
    if (!this.rutina) {
      this.error = 'No hay una rutina para guardar';
      return;
    }
    
    if (!this.rutina.nombre || this.rutina.nombre.trim() === '') {
      this.error = 'La rutina debe tener un nombre';
      return;
    }
    
    if (this.rutina.dias.length === 0) {
      this.error = 'La rutina debe tener al menos un día';
      return;
    }
    
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    
    // Actualizar fecha de modificación
    this.rutina.fechaModificacion = new Date();
    
    // Asegurar que los órdenes estén correctos
    this.actualizarOrdenDias();
    this.actualizarOrdenFases();
    this.actualizarOrdenEjercicios();
    
    const operacion = this.rutina.id === 0 
      ? this.rutinaService.crearRutina(this.rutina)
      : this.rutinaService.actualizarRutina(this.rutina);
    
    operacion.subscribe({
      next: (rutina) => {
        this.rutina = rutina;
        this.rutinaGuardada.emit(rutina);
        this.mensaje = 'Rutina guardada correctamente';
        this.guardando = false;
        // Cerrar automáticamente después de 2 segundos
        setTimeout(() => this.cerrarModal(), 2000);
      },
      error: (err) => {
        this.error = 'Error al guardar la rutina: ' + err.message;
        this.guardando = false;
        console.error('Error al guardar la rutina:', err);
      }
    });
  }
  
  /**
   * Actualiza el orden de las fases en todos los días
   */
  private actualizarOrdenFases(): void {
    if (!this.rutina) return;
    
    this.rutina.dias.forEach(dia => {
      dia.fases.forEach((fase, index) => {
        fase.orden = index + 1;
      });
    });
  }
  
  /**
   * Actualiza el orden de los ejercicios en todas las fases
   */
  private actualizarOrdenEjercicios(): void {
    if (!this.rutina) return;
    
    this.rutina.dias.forEach(dia => {
      dia.fases.forEach(fase => {
        fase.ejercicios.forEach((ejercicio, index) => {
          ejercicio.orden = index + 1;
        });
      });
    });
  }
  
  /**
   * Cancela la edición de la rutina
   */
  cerrarModal(): void {
    this.cancelar.emit();
  }
  
  /**
   * Obtiene el día seleccionado como objeto
   */
  getDiaSeleccionado(): DiaRutina | null {
    if (this.diaSeleccionado === null || !this.rutina) return null;
    
    return typeof this.diaSeleccionado === 'number'
      ? this.rutina.dias[this.diaSeleccionado]
      : this.diaSeleccionado;
  }
  
  /**
   * Obtiene la fase seleccionada como objeto
   */
  getFaseSeleccionada(): FaseRutina | null {
    if (this.faseSeleccionada === null) return null;
    
    const dia = this.getDiaSeleccionado();
    if (!dia) return null;
    
    return typeof this.faseSeleccionada === 'number'
      ? dia.fases[this.faseSeleccionada]
      : this.faseSeleccionada;
  }
  
  /**
   * Genera un ID temporal negativo para nuevos elementos
   */
  private generarIdTemporal(): number {
    return -Math.floor(Math.random() * 1000000);
  }
  
  /**
   * Muestra el video de un ejercicio en un modal
   */
  verVideo(videoUrl: string): void {
    if (!videoUrl) return;
    
    // Crear un elemento modal para mostrar el video
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1050';
    
    // Crear el contenedor del video con tamaño responsivo
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.position = 'relative';
    videoContainer.style.backgroundColor = '#000';
    videoContainer.style.borderRadius = '8px';
    videoContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    videoContainer.style.padding = '0';
    videoContainer.style.maxWidth = '100%';
    
    // Establecer tamaño responsivo: 60% en escritorio, 80% en tablets, 100% en móviles
    videoContainer.style.width = '60%'; // Tamaño base para escritorio
    
    // Media queries para responsividad
    const mediaQueryTablet = window.matchMedia('(max-width: 992px)');
    const mediaQueryMobile = window.matchMedia('(max-width: 576px)');
    
    if (mediaQueryMobile.matches) {
      videoContainer.style.width = '100%'; // Móviles
    } else if (mediaQueryTablet.matches) {
      videoContainer.style.width = '80%'; // Tablets
    }
    
    // Crear el elemento de video
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.borderRadius = '8px';
    
    // Crear la fuente del video
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    
    // Crear botón de cierre
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '1051';
    
    // Agregar evento de cierre
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });
    
    // Agregar evento de cierre al hacer clic fuera del video
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
    
    // Ensamblar el modal
    video.appendChild(source);
    videoContainer.appendChild(video);
    videoContainer.appendChild(closeButton);
    modalOverlay.appendChild(videoContainer);
    
    // Agregar el modal al body
    document.body.appendChild(modalOverlay);
  }
  
  /**
   * Abre el modal para crear un nuevo ejercicio
   */
  abrirModalCrearEjercicio(): void {
    // Aquí se implementaría la lógica para abrir un modal que permita crear un ejercicio desde cero
    // Por ahora, mostraremos un mensaje
    alert('Funcionalidad de crear ejercicio en desarrollo');
    // En una implementación real, se abriría un modal o se navegaría a otra ruta
  }
  
  /**
   * Abre el modal para crear una fase personalizada
   */
  abrirModalCrearFase(): void {
    // Solicitar el nombre de la fase personalizada
    const nombreFase = prompt('Ingrese el nombre de la fase personalizada:');
    if (nombreFase) {
      this.agregarFase(nombreFase);
    }
  }
}

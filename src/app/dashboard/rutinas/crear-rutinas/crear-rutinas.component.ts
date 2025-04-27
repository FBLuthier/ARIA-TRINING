import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Rutina, DiaRutina, FaseRutina, EjercicioRutina } from '../models/rutina.model';
import { RutinaService } from '../services/rutina.service';
import { EjercicioRutinaComponent } from '../ejercicio-rutina/ejercicio-rutina.component';
import { Usuario } from '../../usuarios/models/usuario.model';
import { FaseService } from '../../fases/services/fase.service';
import { Fase } from '../../fases/models/fase.model';
import { EjercicioService } from '../../ejercicios/services/ejercicio.service';
import { Ejercicio } from '../../ejercicios/models/ejercicio.model';

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
  @Input() rutina: Rutina = {
    id: 0,
    usuarioId: 0,
    nombre: '',
    fechaCreacion: new Date(),
    fechaModificacion: new Date(),
    activa: true,
    dias: []
  };
  @Input() modoEdicion: boolean = false;
  
  @Output() rutinaGuardada = new EventEmitter<Rutina>();
  @Output() cancelar = new EventEmitter<void>();
  
  // Variables para el manejo de la interfaz
  diaSeleccionado: DiaRutina | null = null;
  faseSeleccionada: FaseRutina | null = null;
  ejercicioSeleccionado: EjercicioRutina | null = null;
  
  // Modo de edición de ejercicio
  modoEdicionEjercicio: boolean = false;
  
  // Errores y mensajes
  error: string = '';
  mensaje: string = '';
  guardando: boolean = false;
  
  // Fases disponibles para seleccionar
  fasesDisponibles: Fase[] = [];
  ejerciciosDisponibles: Ejercicio[] = [];
  
  constructor(
    private rutinaService: RutinaService,
    private faseService: FaseService,
    private ejercicioService: EjercicioService
  ) {}
  
  ngOnInit(): void {
    // Si no se proporciona un usuario, mostrar error
    if (!this.usuario && !this.usuarioId) {
      this.error = 'No se ha seleccionado un usuario';
      return;
    }
    
    // Si no se proporciona una rutina, crear una nueva
    if (!this.rutina || !this.rutina.id) {
      this.rutina = {
        id: 0,
        usuarioId: this.usuarioId || (this.usuario?.id || 0),
        nombre: '',
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        activa: true,
        dias: []
      };
      
      // Agregar el primer día por defecto
      this.agregarDia();
    } else {
      // Si estamos en modo edición, seleccionar el primer día
      if (this.rutina.dias && this.rutina.dias.length > 0) {
        this.seleccionarDia(this.rutina.dias[0]);
      }
    }
    
    // Cargar las fases disponibles
    this.cargarFasesDisponibles();
    
    // Cargar los ejercicios disponibles
    this.cargarEjerciciosDisponibles();
  }
  
  /**
   * Carga las fases disponibles desde el servicio
   */
  cargarFasesDisponibles(): void {
    this.faseService.obtenerFases().subscribe({
      next: (fases: Fase[]) => {
        this.fasesDisponibles = fases;
      },
      error: (err: any) => {
        console.error('Error al cargar las fases:', err);
        this.error = 'No se pudieron cargar las fases disponibles';
      }
    });
  }
  
  /**
   * Carga los ejercicios disponibles desde el servicio
   */
  cargarEjerciciosDisponibles(): void {
    this.ejercicioService.obtenerEjercicios().subscribe({
      next: (ejercicios: Ejercicio[]) => {
        this.ejerciciosDisponibles = ejercicios;
      },
      error: (err: any) => {
        console.error('Error al cargar los ejercicios:', err);
        this.error = 'No se pudieron cargar los ejercicios disponibles';
      }
    });
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
  }
  
  /**
   * Agrega una nueva fase al día seleccionado
   */
  agregarFase(nombreFase?: string): void {
    if (this.diaSeleccionado === null) return;
    
    const dia = this.getDiaSeleccionado();
    if (!dia) return;
    
    // Verificar si ya existe una fase con este nombre
    const faseExistente = dia.fases.find(f => f.nombre === nombreFase);
    if (faseExistente) {
      this.seleccionarFase(faseExistente);
      return;
    }
    
    const nuevaFase: FaseRutina = {
      id: this.generarIdTemporal(),
      diaRutinaId: dia.id,
      faseId: 0,
      nombre: nombreFase || `Fase ${dia.fases.length + 1}`,
      orden: dia.fases.length + 1,
      indicaciones: '',
      ejercicios: []
    };
    
    dia.fases.push(nuevaFase);
    this.seleccionarFase(nuevaFase);
    
    this.mensaje = `Fase "${nuevaFase.nombre}" agregada correctamente`;
    setTimeout(() => this.mensaje = '', 3000);
  }
  
  /**
   * Agrega un nuevo ejercicio a la fase seleccionada
   */
  agregarEjercicio(fase?: FaseRutina): void {
    // Si se proporciona una fase, la seleccionamos primero
    if (fase) {
      this.seleccionarFase(fase);
    }
    
    // Verificar que haya una fase seleccionada
    if (!this.faseSeleccionada) return;
    
    // Filtrar ejercicios por el tipo de fase seleccionada
    const ejerciciosFiltrados = this.ejerciciosDisponibles.filter(e => {
      // Aquí deberías implementar la lógica para filtrar ejercicios según la fase
      // Por ejemplo, si la fase es "Cardio", mostrar solo ejercicios de tipo cardio
      return true; // Por ahora mostramos todos
    });
    
    // Aquí deberías mostrar un modal o componente para seleccionar un ejercicio
    // Por ahora, crearemos un ejercicio de ejemplo
    const nuevoEjercicio: EjercicioRutina = {
      id: this.generarIdTemporal(),
      faseRutinaId: this.faseSeleccionada.id,
      ejercicioId: 0,
      nombre: 'Nuevo Ejercicio',
      numSeries: 3,
      numRepeticiones: 12,
      tempo: {
        tipo: 'subida-pausa-bajada',
        tiempos: [2, 1, 2]
      },
      descanso: {
        minutos: 0,
        segundos: 60
      },
      camara: '',
      indicaciones: '',
      series: [],
      correcciones: '',
      comentarios: '',
      videoUrl: '',
      orden: this.faseSeleccionada.ejercicios.length + 1
    };
    
    this.faseSeleccionada.ejercicios.push(nuevoEjercicio);
    this.editarEjercicio(nuevoEjercicio);
  }
  
  /**
   * Selecciona un día de la rutina
   */
  seleccionarDia(dia: DiaRutina): void {
    this.diaSeleccionado = dia;
    this.faseSeleccionada = null;
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Selecciona una fase del día
   */
  seleccionarFase(fase: FaseRutina): void {
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
      
      // Si era el día seleccionado, deseleccionar
      if (this.diaSeleccionado === dia) {
        this.diaSeleccionado = null;
        this.faseSeleccionada = null;
        this.ejercicioSeleccionado = null;
      }
      
      // Si quedan días, seleccionar el primero
      if (this.rutina.dias.length > 0) {
        this.seleccionarDia(this.rutina.dias[0]);
      }
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
      
      // Si era la fase seleccionada, deseleccionar
      if (this.faseSeleccionada === fase) {
        this.faseSeleccionada = null;
        this.ejercicioSeleccionado = null;
      }
      
      // Si quedan fases, seleccionar la primera
      if (dia.fases.length > 0) {
        this.seleccionarFase(dia.fases[0]);
      }
    }
  }
  
  /**
   * Elimina un ejercicio de la fase seleccionada
   */
  eliminarEjercicio(ejercicio: EjercicioRutina): void {
    if (!this.faseSeleccionada) return;
    
    const index = this.faseSeleccionada.ejercicios.findIndex(e => e.id === ejercicio.id);
    if (index !== -1) {
      this.faseSeleccionada.ejercicios.splice(index, 1);
      
      // Si era el ejercicio seleccionado, deseleccionar
      if (this.ejercicioSeleccionado === ejercicio) {
        this.ejercicioSeleccionado = null;
        this.modoEdicionEjercicio = false;
      }
    }
  }
  
  /**
   * Guarda la rutina
   */
  guardarRutina(): void {
    if (!this.rutina) return;
    
    // Validar que la rutina tenga un nombre
    if (!this.rutina.nombre) {
      this.error = 'Debe ingresar un nombre para la rutina';
      return;
    }
    
    // Validar que la rutina tenga al menos un día
    if (this.rutina.dias.length === 0) {
      this.error = 'Debe agregar al menos un día a la rutina';
      return;
    }
    
    this.guardando = true;
    
    if (this.modoEdicion) {
      // Actualizar rutina existente
      this.rutinaService.actualizarRutina(this.rutina).subscribe({
        next: (rutina: Rutina) => {
          this.rutina = rutina;
          this.rutinaGuardada.emit(rutina);
          this.mensaje = 'Rutina actualizada correctamente';
          this.guardando = false;
        },
        error: (err: any) => {
          console.error('Error al actualizar la rutina:', err);
          this.error = 'No se pudo actualizar la rutina';
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva rutina
      this.rutinaService.crearRutina(this.rutina).subscribe({
        next: (rutina: Rutina) => {
          this.rutina = rutina;
          this.rutinaGuardada.emit(rutina);
          this.mensaje = 'Rutina creada correctamente';
          this.guardando = false;
        },
        error: (err: any) => {
          console.error('Error al crear la rutina:', err);
          this.error = 'No se pudo crear la rutina';
          this.guardando = false;
        }
      });
    }
  }
  
  /**
   * Cancela la edición de la rutina
   */
  cerrarModal(): void {
    this.cancelar.emit();
  }
  
  /**
   * Cancela la edición de un ejercicio
   */
  cancelarEdicionEjercicio(): void {
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Guarda un ejercicio editado
   */
  guardarEjercicio(ejercicio: EjercicioRutina): void {
    if (!this.faseSeleccionada) return;
    
    // Buscar el ejercicio en la fase seleccionada
    const index = this.faseSeleccionada.ejercicios.findIndex(e => e.id === ejercicio.id);
    if (index !== -1) {
      // Actualizar el ejercicio
      this.faseSeleccionada.ejercicios[index] = ejercicio;
    }
    
    this.ejercicioSeleccionado = null;
    this.modoEdicionEjercicio = false;
  }
  
  /**
   * Obtiene el día seleccionado
   */
  getDiaSeleccionado(): DiaRutina | null {
    if (!this.diaSeleccionado) return null;
    
    return this.diaSeleccionado;
  }
  
  /**
   * Genera un ID temporal para nuevos elementos
   */
  generarIdTemporal(): number {
    return -Math.floor(Math.random() * 1000000);
  }
}

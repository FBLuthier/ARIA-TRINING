import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearEjerciciosComponent } from './crear-ejercicios/crear-ejercicios.component';
import { SafePipe } from '../../shared/pipes/safe.pipe';

interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  mostrarVideo?: boolean;
  faseId: number;
}

interface Fase {
  id: number;
  nombre: string;
  indicaciones: string;
  ejercicios: Ejercicio[];
  expandido: boolean;
}

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearEjerciciosComponent, SafePipe],
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.css']
})
export class EjerciciosComponent implements OnInit {
  @ViewChild(CrearEjerciciosComponent) crearEjerciciosComponent!: CrearEjerciciosComponent;
  
  terminoBusqueda: string = '';
  
  fases: Fase[] = [
    {
      id: 1,
      nombre: 'Activación 1',
      indicaciones: 'Ejercicios de movilidad articular y activación muscular inicial.',
      expandido: false,
      ejercicios: [
        {
          id: 1,
          nombre: 'Movilidad de hombros con banda',
          camara: 'Frontal / Lateral',
          indicaciones: 'Mantener los brazos extendidos y realizar movimientos circulares controlados.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 1
        },
        {
          id: 2,
          nombre: 'Sentadilla con peso corporal',
          camara: 'Lateral',
          indicaciones: 'Mantener la espalda recta y las rodillas alineadas con los pies.',
          mostrarVideo: false,
          faseId: 1
        }
      ]
    },
    {
      id: 2,
      nombre: 'Activación 2',
      indicaciones: 'Ejercicios de activación muscular específica para el entrenamiento principal.',
      expandido: false,
      ejercicios: [
        {
          id: 3,
          nombre: 'Puente de glúteos',
          camara: 'Lateral',
          indicaciones: 'Elevar las caderas manteniendo los pies y hombros en el suelo, apretar glúteos en la parte superior.',
          mostrarVideo: false,
          faseId: 2
        },
        {
          id: 4,
          nombre: 'Plancha con rotación',
          camara: 'Lateral / Frontal',
          indicaciones: 'Mantener el core activado durante todo el movimiento, evitar rotación de caderas.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 2
        }
      ]
    },
    {
      id: 3,
      nombre: 'Potenciación',
      indicaciones: 'Ejercicios explosivos para mejorar la potencia muscular.',
      expandido: false,
      ejercicios: [
        {
          id: 5,
          nombre: 'Salto al cajón',
          camara: 'Lateral',
          indicaciones: 'Realizar un salto explosivo y aterrizar con las rodillas ligeramente flexionadas para absorber el impacto.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 3
        },
        {
          id: 6,
          nombre: 'Lanzamiento de balón medicinal',
          camara: 'Lateral',
          indicaciones: 'Utilizar la rotación del tronco para generar potencia, mantener los pies firmes en el suelo.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 3
        }
      ]
    },
    {
      id: 4,
      nombre: 'Core',
      indicaciones: 'Ejercicios enfocados en fortalecer la musculatura del tronco y estabilidad central.',
      expandido: false,
      ejercicios: [
        {
          id: 7,
          nombre: 'Plancha abdominal',
          camara: 'Lateral',
          indicaciones: 'Mantener el cuerpo en línea recta desde los hombros hasta los tobillos, activar el core durante todo el ejercicio.',
          mostrarVideo: false,
          faseId: 4
        },
        {
          id: 8,
          nombre: 'Russian twist',
          camara: 'Frontal',
          indicaciones: 'Mantener la espalda ligeramente inclinada hacia atrás, girar el tronco de lado a lado manteniendo las piernas elevadas.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 4
        }
      ]
    },
    {
      id: 5,
      nombre: 'Fuerza principal',
      indicaciones: 'Ejercicios compuestos de alta intensidad para desarrollar fuerza muscular.',
      expandido: false,
      ejercicios: [
        {
          id: 9,
          nombre: 'Remo con barra',
          camara: 'Lateral / Lateral posterior',
          indicaciones: 'Mantener la espalda paralela al suelo y llevar los codos pegados a la cadera.',
          mostrarVideo: false,
          faseId: 5
        },
        {
          id: 10,
          nombre: 'Press de banca',
          camara: 'Lateral / Superior',
          indicaciones: 'Mantener los omóplatos retraídos y los pies apoyados en el suelo, bajar la barra hasta rozar el pecho.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 5
        }
      ]
    },
    {
      id: 6,
      nombre: 'Cardio',
      indicaciones: 'Ejercicios para mejorar la capacidad cardiovascular y quemar calorías.',
      expandido: false,
      ejercicios: [
        {
          id: 11,
          nombre: 'Burpees',
          camara: 'Lateral',
          indicaciones: 'Realizar el movimiento de forma fluida, manteniendo la espalda recta durante la flexión.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 6
        },
        {
          id: 12,
          nombre: 'Mountain climbers',
          camara: 'Lateral',
          indicaciones: 'Mantener las caderas bajas y estables, alternar las rodillas hacia el pecho a un ritmo rápido.',
          mostrarVideo: false,
          faseId: 6
        }
      ]
    },
    {
      id: 7,
      nombre: 'Reset',
      indicaciones: 'Ejercicios de recuperación y vuelta a la calma.',
      expandido: false,
      ejercicios: [
        {
          id: 13,
          nombre: 'Estiramiento de isquiotibiales',
          camara: 'Lateral',
          indicaciones: 'Mantener la pierna extendida y la espalda recta, sentir el estiramiento en la parte posterior del muslo.',
          mostrarVideo: false,
          faseId: 7
        },
        {
          id: 14,
          nombre: 'Foam rolling para cuádriceps',
          camara: 'Lateral',
          indicaciones: 'Rodar lentamente sobre el foam roller, detenerse en puntos de tensión durante 20-30 segundos.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 7
        }
      ]
    },
    {
      id: 8,
      nombre: 'Otros',
      indicaciones: 'Ejercicios complementarios y variaciones adicionales.',
      expandido: false,
      ejercicios: [
        {
          id: 15,
          nombre: 'Yoga - Postura del perro boca abajo',
          camara: 'Lateral',
          indicaciones: 'Formar una V invertida con el cuerpo, presionar los talones hacia el suelo y las manos contra la colchoneta.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 8
        },
        {
          id: 16,
          nombre: 'Equilibrio sobre una pierna',
          camara: 'Frontal / Lateral',
          indicaciones: 'Mantener la mirada fija en un punto, activar el core para mayor estabilidad.',
          mostrarVideo: false,
          faseId: 8
        }
      ]
    }
  ];

  // Variables para edición
  ejercicioSeleccionadoParaEditar: Ejercicio | null = null;
  faseSeleccionadaParaEditar: Fase | null = null;
  modoEdicion: boolean = false;

  // Método para alternar la expansión de una fase
  toggleFase(fase: Fase): void {
    fase.expandido = !fase.expandido;
  }

  // Método para buscar ejercicios
  buscarEjercicios(): void {
    // Aquí implementaríamos la lógica de búsqueda
    console.log('Buscando:', this.terminoBusqueda);
  }
  
  // Método para abrir el modal de creación de ejercicio
  abrirModalCrearEjercicio(): void {
    this.modoEdicion = false;
    this.ejercicioSeleccionadoParaEditar = null;
    this.faseSeleccionadaParaEditar = null;
    
    // Abrir el modal usando JavaScript nativo
    const modal = document.getElementById('crearEjercicioModal');
    if (modal) {
      // @ts-ignore
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }
  
  // Método para abrir el modal con una fase preseleccionada
  abrirModalConFase(fase: Fase): void {
    this.modoEdicion = false;
    this.ejercicioSeleccionadoParaEditar = null;
    this.faseSeleccionadaParaEditar = fase;
    
    // Abrir el modal usando JavaScript nativo
    const modal = document.getElementById('crearEjercicioModal');
    if (modal) {
      // @ts-ignore
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
      
      // Asignar la fase seleccionada al componente hijo después de un breve retraso
      setTimeout(() => {
        if (this.crearEjerciciosComponent) {
          this.crearEjerciciosComponent.faseSeleccionada = fase;
        }
      }, 100);
    }
  }
  
  // Método para editar un ejercicio
  editarEjercicio(ejercicio: Ejercicio, fase: Fase): void {
    this.modoEdicion = true;
    this.ejercicioSeleccionadoParaEditar = { ...ejercicio };
    this.faseSeleccionadaParaEditar = fase;
    
    // Abrir el modal usando JavaScript nativo
    const modal = document.getElementById('crearEjercicioModal');
    if (modal) {
      // @ts-ignore
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
      
      // Asignar los datos al componente hijo después de un breve retraso
      setTimeout(() => {
        if (this.crearEjerciciosComponent) {
          this.crearEjerciciosComponent.modoEdicion = true;
          this.crearEjerciciosComponent.ejercicioParaEditar = this.ejercicioSeleccionadoParaEditar;
          this.crearEjerciciosComponent.faseSeleccionada = fase;
          this.crearEjerciciosComponent.cargarDatosEjercicio();
        }
      }, 100);
    }
  }
  
  // Método para eliminar un ejercicio
  eliminarEjercicio(ejercicio: Ejercicio, fase: Fase): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el ejercicio "${ejercicio.nombre}"?`)) {
      // Encontrar el índice del ejercicio en la fase
      const index = fase.ejercicios.findIndex(e => e.id === ejercicio.id);
      
      if (index !== -1) {
        // Eliminar el ejercicio de la fase
        fase.ejercicios.splice(index, 1);
        
        // Mostrar mensaje de éxito
        this.mostrarMensaje('Ejercicio eliminado correctamente', 'success');
      }
    }
  }
  
  // Método para manejar el evento de ejercicio editado
  onEjercicioEditado(ejercicioEditado: Ejercicio): void {
    // Encontrar la fase a la que pertenece el ejercicio
    const fase = this.fases.find(f => f.id === ejercicioEditado.faseId);
    
    if (fase && this.ejercicioSeleccionadoParaEditar) {
      // Encontrar el índice del ejercicio en la fase
      const index = fase.ejercicios.findIndex(e => e.id === this.ejercicioSeleccionadoParaEditar!.id);
      
      if (index !== -1) {
        // Actualizar el ejercicio en la fase
        fase.ejercicios[index] = {
          ...ejercicioEditado,
          mostrarVideo: fase.ejercicios[index].mostrarVideo
        };
        
        // Mostrar mensaje de éxito
        this.mostrarMensaje('Ejercicio actualizado correctamente', 'success');
      }
    }
  }
  
  // Método para abrir el modal con una fase específica
  abrirModalConFaseEspecifico(fase: Fase): void {
    this.abrirModalConFase(fase);
  }
  
  // Método para mostrar/ocultar el video de un ejercicio
  toggleVideo(ejercicio: Ejercicio): void {
    // Si el video ya está visible, solo lo ocultamos
    if (ejercicio.mostrarVideo) {
      ejercicio.mostrarVideo = false;
      return;
    }
    
    // Si el ejercicio no tiene URL de video, no hacemos nada
    if (!ejercicio.videoUrl) {
      console.warn('Este ejercicio no tiene URL de video');
      return;
    }
    
    // Procesar la URL de YouTube si aún no ha sido procesada
    ejercicio.videoUrl = this.procesarUrlYoutube(ejercicio.videoUrl);
    
    // Mostrar el video
    ejercicio.mostrarVideo = true;
    
    // Log para depuración
    console.log('Video URL procesada:', ejercicio.videoUrl);
  }
  
  // Método para cerrar el video
  cerrarVideo(ejercicio: Ejercicio): void {
    ejercicio.mostrarVideo = false;
  }
  
  // Método para procesar la URL de YouTube y convertirla en formato embebible
  procesarUrlYoutube(url: string): string {
    if (!url) return '';
    
    // Si ya es una URL de embed, devolverla tal cual
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extraer el ID del video
    let videoId = '';
    
    // Formato: youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch?v=')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } 
    // Formato: youtu.be/ID
    else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0].split('&')[0];
      }
    }
    // Formato: youtube.com/shorts/ID
    else if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('youtube.com/shorts/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0].split('&')[0];
      }
    }
    
    if (!videoId) {
      console.error('No se pudo extraer el ID del video de la URL:', url);
      return '';
    }
    
    console.log('ID del video extraído:', videoId);
    
    // Construir la URL de embed
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Método para manejar el evento de ejercicio creado
  onEjercicioCreado(ejercicio: Ejercicio): void {
    console.log('Ejercicio creado:', ejercicio);
    
    // Encontrar la fase a la que pertenece el ejercicio
    const fase = this.fases.find(f => f.id === ejercicio.faseId);
    
    if (fase) {
      // Agregar el ejercicio a la fase
      fase.ejercicios.push({
        ...ejercicio,
        mostrarVideo: false
      });
      
      // Cerrar el modal
      this.cerrarModal();
      
      // Mostrar mensaje de éxito
      this.mostrarMensaje('Ejercicio creado correctamente', 'success');
    }
  }
  
  // Método para mostrar mensaje
  mostrarMensaje(mensaje: string, tipo: string): void {
    console.log(`Mensaje ${tipo}: ${mensaje}`);
  }
  
  // Método para cerrar el modal
  cerrarModal(): void {
    const modal = document.getElementById('crearEjercicioModal');
    if (modal) {
      // @ts-ignore
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
  
  ngOnInit(): void {
  }
}

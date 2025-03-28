import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SafePipe } from '../../shared/pipes/safe.pipe';

interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  mostrarVideo?: boolean;
  faseId: number;
  indicacionesExpandidas?: boolean;
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
  imports: [CommonModule, FormsModule, RouterModule, SafePipe],
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.css']
})
export class EjerciciosComponent implements OnInit {
  
  terminoBusqueda: string = '';
  mostrarFiltros: boolean = false;
  faseSeleccionadaFiltro: Fase | null = null;
  ejerciciosFiltrados: Ejercicio[] = [];
  todosLosEjercicios: Ejercicio[] = [];
  
  // Variables para paginación
  ejerciciosPaginados: Ejercicio[] = [];
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 1;
  paginasArray: number[] = [];
  
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
          faseId: 1,
          indicacionesExpandidas: false
        },
        {
          id: 2,
          nombre: 'Sentadilla con peso corporal',
          camara: 'Lateral',
          indicaciones: 'Mantener la espalda recta y las rodillas alineadas con los pies.',
          mostrarVideo: false,
          faseId: 1,
          indicacionesExpandidas: false
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
          faseId: 2,
          indicacionesExpandidas: false
        },
        {
          id: 4,
          nombre: 'Plancha con rotación',
          camara: 'Lateral / Frontal',
          indicaciones: 'Mantener el core activado durante todo el movimiento, evitar rotación de caderas.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 2,
          indicacionesExpandidas: false
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
          faseId: 3,
          indicacionesExpandidas: false
        },
        {
          id: 6,
          nombre: 'Lanzamiento de balón medicinal',
          camara: 'Lateral',
          indicaciones: 'Utilizar la rotación del tronco para generar potencia, mantener los pies firmes en el suelo.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 3,
          indicacionesExpandidas: false
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
          faseId: 4,
          indicacionesExpandidas: false
        },
        {
          id: 8,
          nombre: 'Russian twist',
          camara: 'Frontal',
          indicaciones: 'Mantener la espalda ligeramente inclinada hacia atrás, girar el tronco de lado a lado manteniendo las piernas elevadas.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 4,
          indicacionesExpandidas: false
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
          faseId: 5,
          indicacionesExpandidas: false
        },
        {
          id: 10,
          nombre: 'Press de banca',
          camara: 'Lateral / Superior',
          indicaciones: 'Mantener los omóplatos retraídos y los pies apoyados en el suelo, bajar la barra hasta rozar el pecho.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 5,
          indicacionesExpandidas: false
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
          faseId: 6,
          indicacionesExpandidas: false
        },
        {
          id: 12,
          nombre: 'Mountain climbers',
          camara: 'Lateral',
          indicaciones: 'Mantener las caderas bajas y estables, alternar las rodillas hacia el pecho a un ritmo rápido.',
          mostrarVideo: false,
          faseId: 6,
          indicacionesExpandidas: false
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
          faseId: 7,
          indicacionesExpandidas: false
        },
        {
          id: 14,
          nombre: 'Foam rolling para cuádriceps',
          camara: 'Lateral',
          indicaciones: 'Rodar lentamente sobre el foam roller, detenerse en puntos de tensión durante 20-30 segundos.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          mostrarVideo: false,
          faseId: 7,
          indicacionesExpandidas: false
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
          faseId: 8,
          indicacionesExpandidas: false
        },
        {
          id: 16,
          nombre: 'Equilibrio sobre una pierna',
          camara: 'Frontal / Lateral',
          indicaciones: 'Mantener la mirada fija en un punto, activar el core para mayor estabilidad.',
          mostrarVideo: false,
          faseId: 8,
          indicacionesExpandidas: false
        }
      ]
    }
  ];

  ngOnInit(): void {
    // Inicializar la lista de todos los ejercicios
    this.inicializarEjercicios();
    
    // Inicialmente mostrar todos los ejercicios
    this.ejerciciosFiltrados = [...this.todosLosEjercicios];
    
    // Inicializar paginación
    this.actualizarPaginacion();
  }
  
  // Método para inicializar la lista de todos los ejercicios
  inicializarEjercicios(): void {
    this.todosLosEjercicios = [];
    
    // Extraer todos los ejercicios de todas las fases
    this.fases.forEach(fase => {
      // Asignar el ID de fase a cada ejercicio
      const ejerciciosConFase = fase.ejercicios.map(ejercicio => ({
        ...ejercicio,
        faseId: fase.id
      }));
      
      this.todosLosEjercicios = [...this.todosLosEjercicios, ...ejerciciosConFase];
    });
  }
  
  // Método para filtrar ejercicios por fase
  filtrarPorFase(fase: Fase | null): void {
    this.faseSeleccionadaFiltro = fase;
    
    if (fase === null) {
      // Si no hay fase seleccionada, mostrar todos los ejercicios
      this.ejerciciosFiltrados = [...this.todosLosEjercicios];
    } else {
      // Filtrar ejercicios por la fase seleccionada
      this.ejerciciosFiltrados = this.todosLosEjercicios.filter(ejercicio => ejercicio.faseId === fase.id);
    }
    
    // Si hay término de búsqueda, aplicar también ese filtro
    if (this.terminoBusqueda.trim() !== '') {
      this.buscarEjercicios();
    }
    
    // Resetear paginación y actualizar
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }
  
  // Método para buscar ejercicios
  buscarEjercicios(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    
    if (termino === '') {
      // Si no hay término de búsqueda, volver a aplicar solo el filtro de fase
      this.filtrarPorFase(this.faseSeleccionadaFiltro);
      return;
    }
    
    // Filtrar primero por fase si hay una seleccionada
    let ejerciciosAFiltrar = this.faseSeleccionadaFiltro 
      ? this.todosLosEjercicios.filter(e => e.faseId === this.faseSeleccionadaFiltro!.id)
      : [...this.todosLosEjercicios];
    
    // Luego filtrar por el término de búsqueda
    this.ejerciciosFiltrados = ejerciciosAFiltrar.filter(ejercicio => {
      return ejercicio.nombre.toLowerCase().includes(termino) || 
             ejercicio.indicaciones.toLowerCase().includes(termino) ||
             ejercicio.camara.toLowerCase().includes(termino);
    });
    
    // Resetear paginación y actualizar
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }
  
  // Método para actualizar la paginación
  actualizarPaginacion(): void {
    // Calcular el total de páginas
    this.totalPaginas = Math.ceil(this.ejerciciosFiltrados.length / this.elementosPorPagina);
    
    // Crear array con números de página para la navegación
    this.paginasArray = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      // Limitar a mostrar solo 5 páginas alrededor de la página actual
      if (
        i === 1 || 
        i === this.totalPaginas || 
        (i >= this.paginaActual - 2 && i <= this.paginaActual + 2)
      ) {
        this.paginasArray.push(i);
      }
    }
    
    // Eliminar duplicados y ordenar
    this.paginasArray = [...new Set(this.paginasArray)].sort((a, b) => a - b);
    
    // Obtener los ejercicios para la página actual
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = Math.min(inicio + this.elementosPorPagina, this.ejerciciosFiltrados.length);
    this.ejerciciosPaginados = this.ejerciciosFiltrados.slice(inicio, fin);
  }
  
  // Método para cambiar de página
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
  
  // Método para obtener el nombre de la fase por su ID
  getNombreFase(faseId: number): string {
    const fase = this.fases.find(f => f.id === faseId);
    return fase ? fase.nombre : 'Sin fase asignada';
  }
  
  // Método para obtener la fase por su ID
  getFasePorId(faseId: number): Fase | null {
    return this.fases.find(f => f.id === faseId) || null;
  }
  
  // Método para alternar la visualización de un video
  toggleVideo(ejercicio: Ejercicio): void {
    // Primero, cerrar todos los videos
    this.ejerciciosFiltrados.forEach(e => {
      if (e !== ejercicio) {
        e.mostrarVideo = false;
      }
    });
    
    // Luego, alternar el estado del video del ejercicio seleccionado
    ejercicio.mostrarVideo = !ejercicio.mostrarVideo;
    
    // Si el ejercicio tiene URL de video y no ha sido procesada, procesarla
    if (ejercicio.videoUrl && !ejercicio.videoUrl.includes('youtube.com/embed/')) {
      ejercicio.videoUrl = this.procesarUrlYoutube(ejercicio.videoUrl);
    }
  }
  
  // Método para procesar la URL de YouTube
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
    
    // Construir la URL de embed
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Método para eliminar un ejercicio
  eliminarEjercicio(ejercicio: Ejercicio, fase: Fase | null): void {
    if (!fase) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar el ejercicio "${ejercicio.nombre}"?`)) {
      // Eliminar el ejercicio de la fase
      const index = fase.ejercicios.findIndex(e => e.id === ejercicio.id);
      if (index !== -1) {
        fase.ejercicios.splice(index, 1);
      }
      
      // Eliminar el ejercicio de la lista de todos los ejercicios
      const indexTodos = this.todosLosEjercicios.findIndex(e => e.id === ejercicio.id);
      if (indexTodos !== -1) {
        this.todosLosEjercicios.splice(indexTodos, 1);
      }
      
      // Actualizar la lista de ejercicios filtrados
      this.ejerciciosFiltrados = this.ejerciciosFiltrados.filter(e => e.id !== ejercicio.id);
      
      // Actualizar la paginación
      this.actualizarPaginacion();
    }
  }
  
  // Método para expandir/colapsar una fase (ya no se usa en la nueva interfaz)
  toggleFase(fase: Fase): void {
    fase.expandido = !fase.expandido;
  }
  
  // Método para expandir/colapsar las indicaciones de un ejercicio
  toggleIndicaciones(ejercicio: Ejercicio): void {
    ejercicio.indicacionesExpandidas = !ejercicio.indicacionesExpandidas;
  }
}

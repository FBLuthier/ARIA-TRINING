import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CrearEjerciciosComponent } from '../crear-ejercicios/crear-ejercicios.component';

interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  faseId: number;
  mostrarVideo?: boolean;
}

interface Fase {
  id: number;
  nombre: string;
  indicaciones: string;
  ejercicios: Ejercicio[];
  expandido?: boolean;
}

@Component({
  selector: 'app-editar-ejercicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CrearEjerciciosComponent],
  templateUrl: './editar-ejercicio.component.html',
  styleUrls: ['./editar-ejercicio.component.css']
})
export class EditarEjercicioComponent implements OnInit {
  terminoBusqueda: string = '';
  fases: Fase[] = [];
  ejercicios: Ejercicio[] = [];
  ejerciciosFiltrados: Ejercicio[] = [];
  ejercicioSeleccionado: Ejercicio | null = null;
  faseSeleccionadaFiltro: Fase | null = null;
  mostrarFormulario: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Aquí cargaríamos los datos desde el servicio
    // Por ahora usaremos datos de ejemplo
    this.fases = [
      {
        id: 1,
        nombre: 'Activación 1',
        indicaciones: 'Ejercicios de movilidad articular y activación muscular inicial.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 2,
        nombre: 'Activación 2',
        indicaciones: 'Ejercicios de activación muscular específica para el entrenamiento principal.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 3,
        nombre: 'Potenciación',
        indicaciones: 'Ejercicios explosivos para mejorar la potencia muscular.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 4,
        nombre: 'Core',
        indicaciones: 'Ejercicios enfocados en fortalecer la musculatura del tronco y estabilidad central.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 5,
        nombre: 'Fuerza principal',
        indicaciones: 'Ejercicios compuestos de alta intensidad para desarrollar fuerza muscular.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 6,
        nombre: 'Cardio',
        indicaciones: 'Ejercicios para mejorar la capacidad cardiovascular y quemar calorías.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 7,
        nombre: 'Reset',
        indicaciones: 'Ejercicios de recuperación y vuelta a la calma.',
        expandido: false,
        ejercicios: []
      },
      {
        id: 8,
        nombre: 'Otros',
        indicaciones: 'Ejercicios complementarios y variaciones adicionales.',
        expandido: false,
        ejercicios: []
      }
    ];

    // Datos de ejemplo para ejercicios
    this.ejercicios = [
      {
        id: 1,
        nombre: 'Movilidad de hombros con banda',
        camara: 'Frontal / Lateral',
        indicaciones: 'Mantener los brazos extendidos y realizar movimientos circulares controlados.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 1
      },
      {
        id: 2,
        nombre: 'Sentadilla con peso corporal',
        camara: 'Lateral',
        indicaciones: 'Mantener la espalda recta y las rodillas alineadas con los pies.',
        faseId: 1
      },
      {
        id: 3,
        nombre: 'Puente de glúteos',
        camara: 'Lateral',
        indicaciones: 'Elevar las caderas manteniendo los pies y hombros en el suelo, apretar glúteos en la parte superior.',
        faseId: 2
      },
      {
        id: 4,
        nombre: 'Plancha con rotación',
        camara: 'Lateral / Frontal',
        indicaciones: 'Mantener el core activado durante todo el movimiento, evitar rotación de caderas.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 2
      },
      {
        id: 5,
        nombre: 'Salto al cajón',
        camara: 'Lateral',
        indicaciones: 'Realizar un salto explosivo y aterrizar con las rodillas ligeramente flexionadas para absorber el impacto.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 3
      },
      {
        id: 6,
        nombre: 'Plancha frontal',
        camara: 'Lateral',
        indicaciones: 'Mantener el cuerpo en línea recta, activar el core y mantener la posición durante el tiempo indicado.',
        faseId: 4
      },
      {
        id: 7,
        nombre: 'Crunch abdominal',
        camara: 'Lateral',
        indicaciones: 'Elevar los hombros del suelo contrayendo los abdominales, mantener la tensión en la parte superior.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 4
      },
      {
        id: 8,
        nombre: 'Press de banca',
        camara: 'Lateral',
        indicaciones: 'Mantener los hombros retraídos y los pies apoyados en el suelo, bajar la barra hasta rozar el pecho.',
        faseId: 5
      },
      {
        id: 9,
        nombre: 'Sentadilla con barra',
        camara: 'Frontal / Lateral',
        indicaciones: 'Mantener la espalda recta y descender hasta que los muslos estén paralelos al suelo.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 5
      },
      {
        id: 10,
        nombre: 'Burpees',
        camara: 'Lateral',
        indicaciones: 'Realizar el movimiento completo de forma fluida, manteniendo el ritmo durante toda la serie.',
        faseId: 6
      },
      {
        id: 11,
        nombre: 'Saltos de cuerda',
        camara: 'Frontal',
        indicaciones: 'Mantener un ritmo constante, saltar con la punta de los pies y mantener los codos cerca del cuerpo.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 6
      },
      {
        id: 12,
        nombre: 'Estiramientos de isquiotibiales',
        camara: 'Lateral',
        indicaciones: 'Mantener la posición durante 30 segundos, respirar profundamente y evitar rebotes.',
        faseId: 7
      },
      {
        id: 13,
        nombre: 'Foam roller para cuádriceps',
        camara: 'Lateral',
        indicaciones: 'Rodar lentamente sobre la zona, detenerse en puntos de tensión durante 20-30 segundos.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 7
      },
      {
        id: 14,
        nombre: 'Ejercicio de equilibrio en bosu',
        camara: 'Frontal / Lateral',
        indicaciones: 'Mantener la posición de equilibrio, activar el core y realizar pequeños ajustes para mantener la estabilidad.',
        faseId: 8
      },
      {
        id: 15,
        nombre: 'Ejercicio de coordinación con escalera',
        camara: 'Frontal',
        indicaciones: 'Realizar el patrón de pisadas a velocidad moderada, aumentar la velocidad progresivamente.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        faseId: 8
      }
    ];

    // Inicialmente no mostramos ejercicios filtrados
    this.ejerciciosFiltrados = [];
  }

  buscarEjercicios(): void {
    if (!this.terminoBusqueda.trim() && !this.faseSeleccionadaFiltro) {
      this.ejerciciosFiltrados = [];
      return;
    }

    // Filtrar primero por fase si hay una seleccionada
    let ejerciciosFiltrados = this.faseSeleccionadaFiltro 
      ? this.ejercicios.filter(e => e.faseId === this.faseSeleccionadaFiltro!.id)
      : [...this.ejercicios];

    // Si hay término de búsqueda, filtrar por nombre e indicaciones
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ejercicio => {
        const nombre = ejercicio.nombre.toLowerCase();
        const indicaciones = ejercicio.indicaciones.toLowerCase();
        return nombre.includes(termino) || 
               indicaciones.includes(termino) || 
               ejercicio.id.toString() === termino;
      });
    }

    this.ejerciciosFiltrados = ejerciciosFiltrados;
  }

  filtrarPorFase(fase: Fase | null): void {
    this.faseSeleccionadaFiltro = fase;
    this.buscarEjercicios();
  }

  seleccionarEjercicio(ejercicio: Ejercicio): void {
    this.ejercicioSeleccionado = { ...ejercicio };
    this.mostrarFormulario = true;
  }

  onEjercicioEditado(ejercicio: Ejercicio): void {
    // Aquí actualizaríamos el ejercicio en el servicio
    console.log('Ejercicio editado:', ejercicio);
    
    // Actualizamos el ejercicio en la lista local
    const index = this.ejercicios.findIndex(e => e.id === ejercicio.id);
    if (index !== -1) {
      this.ejercicios[index] = { ...ejercicio };
    }
    
    // Reiniciamos el estado
    this.ejercicioSeleccionado = null;
    this.mostrarFormulario = false;
    this.terminoBusqueda = '';
    this.ejerciciosFiltrados = [];
    this.faseSeleccionadaFiltro = null;
  }

  cancelarEdicion(): void {
    this.ejercicioSeleccionado = null;
    this.mostrarFormulario = false;
    this.terminoBusqueda = '';
    this.ejerciciosFiltrados = [];
  }

  getNombreFase(faseId: number): string {
    const fase = this.fases.find(f => f.id === faseId);
    return fase ? fase.nombre : 'Sin fase asignada';
  }
}

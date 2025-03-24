/**
 * Modelo para la rutina principal
 */
export interface Rutina {
  id: number;
  usuarioId: number;
  nombre: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  activa: boolean;
  dias: DiaRutina[];
}

/**
 * Modelo para un día de rutina
 */
export interface DiaRutina {
  id: number;
  rutinaId: number;
  nombre: string; // Ej: "Día 1", "Lunes", etc.
  orden: number; // Para organizar los días
  fases: FaseRutina[];
}

/**
 * Modelo para una fase dentro de un día
 */
export interface FaseRutina {
  id: number;
  diaRutinaId: number;
  faseId: number; // Referencia a la fase original
  nombre: string; // Nombre de la fase
  indicaciones: string;
  orden: number;
  ejercicios: EjercicioRutina[];
}

/**
 * Modelo para un ejercicio dentro de una fase
 */
export interface EjercicioRutina {
  id: number;
  faseRutinaId: number;
  ejercicioId: number; // Referencia al ejercicio original
  nombre: string;
  numSeries: number;
  numRepeticiones: number;
  tempo: {
    tipo: 'subida-pausa-bajada' | 'bajada-pausa-subida';
    tiempos: [number, number, number]; // [subida/bajada, pausa, bajada/subida]
  };
  descanso: {
    minutos: number;
    segundos: number;
  };
  camara: string; // Heredado del ejercicio original
  indicaciones: string; // Heredado del ejercicio original
  series: SerieEjercicio[];
  correcciones: string;
  comentarios: string;
  videoUrl: string; // URL del video del ejercicio original
  videoEjecucionUrl?: string; // URL del video subido por el usuario
  orden: number; // Posición del ejercicio dentro de la fase
}

/**
 * Modelo para una serie específica de un ejercicio
 */
export interface SerieEjercicio {
  id: number;
  ejercicioRutinaId: number;
  numero: number; // 1, 2, 3, etc.
  pesoObjetivo?: number;
  pesoRealizado?: number;
  repeticionesRealizadas?: number;
  completada: boolean;
  fecha?: Date; // Fecha en que se completó
}

/**
 * Modelo para el historial de rutinas
 */
export interface HistorialRutina {
  id: number;
  rutinaId: number;
  usuarioId: number;
  semana: number;
  año: number;
  fechaInicio: Date;
  fechaFin: Date;
  datosRutina: Rutina; // Copia completa de la rutina en ese momento
  rendimiento: number; // Porcentaje de cumplimiento
}

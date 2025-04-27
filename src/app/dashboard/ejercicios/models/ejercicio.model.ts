/**
 * Modelo para ejercicios
 */
export interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  tipoEjercicioId: number;
  tipoEjercicio?: string;
  categoriaId: number;
  categoria?: string;
  nivelId: number;
  nivel?: string;
  videoUrl?: string;
  imagenUrl?: string;
  instrucciones?: string;
  musculos?: string[];
  equipamiento?: string[];
  activo: boolean;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

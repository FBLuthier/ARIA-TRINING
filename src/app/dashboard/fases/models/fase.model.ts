export interface Fase {
  id: number;
  nombre: string;
  descripcion: string;
  indicaciones?: string;
  tipoFase?: string;
  ejercicios?: any[]; // Referencia a los ejercicios asociados a esta fase
}

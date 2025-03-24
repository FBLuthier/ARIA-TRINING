export interface Fase {
  id: number;
  nombre: string;
  indicaciones?: string;
  expandido?: boolean;
  ejercicios: Ejercicio[];
}

export interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  faseId: number;
  mostrarVideo?: boolean;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  camara: string;
  indicaciones: string;
  videoUrl?: string;
  faseId: number;
  mostrarVideo?: boolean;
}

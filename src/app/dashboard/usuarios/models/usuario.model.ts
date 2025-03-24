export interface Usuario {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro';
  altura?: number; // en cm
  peso?: number; // en kg
  objetivo?: string;
  nivelActividad?: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy activo';
  fechaRegistro: Date;
  activo: boolean;
  fotoPerfil?: string;
  notas?: string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Fase } from '../models/fase.model';

@Injectable({
  providedIn: 'root'
})
export class FaseService {
  private apiUrl = 'assets/data/fases.json'; // URL a un archivo JSON local para desarrollo
  
  // Fases predefinidas para usar cuando no hay conexión o para desarrollo
  private fasesPredefinidas: Fase[] = [
    { id: 1, nombre: 'Activación 1', descripcion: 'Primera fase de activación' },
    { id: 2, nombre: 'Activación 2', descripcion: 'Segunda fase de activación' },
    { id: 3, nombre: 'Potenciación', descripcion: 'Fase de potenciación muscular' },
    { id: 4, nombre: 'Core', descripcion: 'Ejercicios para el core' },
    { id: 5, nombre: 'Fuerza Principal', descripcion: 'Ejercicios principales de fuerza' },
    { id: 6, nombre: 'Cardio', descripcion: 'Ejercicios cardiovasculares' },
    { id: 7, nombre: 'Reset', descripcion: 'Fase de recuperación' },
    { id: 8, nombre: 'Otros', descripcion: 'Otros tipos de ejercicios' }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las fases disponibles
   */
  obtenerFases(): Observable<Fase[]> {
    // Para desarrollo, devolvemos las fases predefinidas
    return of(this.fasesPredefinidas);
    
    // Cuando se implemente el backend, usar esto:
    /*
    return this.http.get<Fase[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener fases:', error);
        return of(this.fasesPredefinidas);
      })
    );
    */
  }

  /**
   * Obtiene una fase por su ID
   */
  obtenerFasePorId(id: number): Observable<Fase | undefined> {
    return this.obtenerFases().pipe(
      map(fases => fases.find(fase => fase.id === id))
    );
  }

  /**
   * Crea una nueva fase
   */
  crearFase(fase: Fase): Observable<Fase> {
    // Simulamos la creación asignando un ID
    const nuevaFase = { ...fase, id: this.generarId() };
    this.fasesPredefinidas.push(nuevaFase);
    return of(nuevaFase);
  }

  /**
   * Actualiza una fase existente
   */
  actualizarFase(fase: Fase): Observable<Fase> {
    const index = this.fasesPredefinidas.findIndex(f => f.id === fase.id);
    if (index !== -1) {
      this.fasesPredefinidas[index] = { ...fase };
      return of(this.fasesPredefinidas[index]);
    }
    return of(fase);
  }

  /**
   * Elimina una fase por su ID
   */
  eliminarFase(id: number): Observable<boolean> {
    const index = this.fasesPredefinidas.findIndex(f => f.id === id);
    if (index !== -1) {
      this.fasesPredefinidas.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  /**
   * Genera un ID único para una nueva fase
   */
  private generarId(): number {
    const ids = this.fasesPredefinidas.map(fase => fase.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}

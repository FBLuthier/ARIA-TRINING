import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Ejercicio } from '../models/ejercicio.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private apiUrl = `${environment.apiUrl}/ejercicios`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los ejercicios disponibles
   */
  obtenerEjercicios(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener ejercicios', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un ejercicio por su ID
   */
  obtenerEjercicioPorId(id: number): Observable<Ejercicio | null> {
    return this.http.get<Ejercicio>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener ejercicio con ID ${id}`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo ejercicio
   */
  crearEjercicio(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.apiUrl, ejercicio).pipe(
      catchError(error => {
        console.error('Error al crear ejercicio', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un ejercicio existente
   */
  actualizarEjercicio(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.put<Ejercicio>(`${this.apiUrl}/${ejercicio.id}`, ejercicio).pipe(
      catchError(error => {
        console.error(`Error al actualizar ejercicio con ID ${ejercicio.id}`, error);
        throw error;
      })
    );
  }

  /**
   * Elimina un ejercicio
   */
  eliminarEjercicio(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error al eliminar ejercicio con ID ${id}`, error);
        return of(false);
      })
    );
  }

  /**
   * Obtiene ejercicios por tipo
   */
  obtenerEjerciciosPorTipo(tipoId: number): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(`${this.apiUrl}/tipo/${tipoId}`).pipe(
      catchError(error => {
        console.error(`Error al obtener ejercicios por tipo ${tipoId}`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene ejercicios por categoría
   */
  obtenerEjerciciosPorCategoria(categoriaId: number): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(`${this.apiUrl}/categoria/${categoriaId}`).pipe(
      catchError(error => {
        console.error(`Error al obtener ejercicios por categoría ${categoriaId}`, error);
        return of([]);
      })
    );
  }
}

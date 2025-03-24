import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Rutina, HistorialRutina } from '../models/rutina.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private apiUrl = `${environment.apiUrl}/rutinas`;
  
  // Datos de prueba para desarrollo
  private rutinasActivas: Map<number, Rutina> = new Map();
  private historialRutinas: Map<number, HistorialRutina[]> = new Map();
  
  constructor(private http: HttpClient) {
    // Inicializar algunos datos de prueba
    this.inicializarDatosPrueba();
  }
  
  /**
   * Obtiene la rutina activa de un usuario
   */
  obtenerRutinaActiva(usuarioId: number): Observable<Rutina | null> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Rutina>(`${this.apiUrl}/usuario/${usuarioId}/activa`);
    
    // Para desarrollo, usamos datos locales
    return of(this.rutinasActivas.get(usuarioId) || null);
  }
  
  /**
   * Verifica si un usuario tiene una rutina activa
   */
  tieneRutinaActiva(usuarioId: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<boolean>(`${this.apiUrl}/usuario/${usuarioId}/tiene-activa`);
    
    // Para desarrollo, usamos datos locales
    return of(this.rutinasActivas.has(usuarioId));
  }
  
  /**
   * Verifica si un usuario tiene historial de rutinas
   */
  tieneHistorialRutinas(usuarioId: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<boolean>(`${this.apiUrl}/usuario/${usuarioId}/tiene-historial`);
    
    // Para desarrollo, usamos datos locales
    return of(this.historialRutinas.has(usuarioId) && (this.historialRutinas.get(usuarioId)?.length || 0) > 0);
  }
  
  /**
   * Crea una nueva rutina para un usuario
   */
  crearRutina(rutina: Rutina): Observable<Rutina> {
    // En producción, esto sería una llamada HTTP
    // return this.http.post<Rutina>(this.apiUrl, rutina);
    
    // Para desarrollo, usamos datos locales
    rutina.id = this.generarId();
    rutina.fechaCreacion = new Date();
    rutina.fechaModificacion = new Date();
    rutina.activa = true;
    
    // Asignar IDs a los días, fases y ejercicios
    rutina.dias.forEach(dia => {
      dia.id = this.generarId();
      dia.rutinaId = rutina.id;
      
      dia.fases.forEach(fase => {
        fase.id = this.generarId();
        fase.diaRutinaId = dia.id;
        
        fase.ejercicios.forEach(ejercicio => {
          ejercicio.id = this.generarId();
          ejercicio.faseRutinaId = fase.id;
          
          ejercicio.series.forEach(serie => {
            serie.id = this.generarId();
            serie.ejercicioRutinaId = ejercicio.id;
          });
        });
      });
    });
    
    this.rutinasActivas.set(rutina.usuarioId, rutina);
    return of(rutina);
  }
  
  /**
   * Actualiza una rutina existente
   */
  actualizarRutina(rutina: Rutina): Observable<Rutina> {
    // En producción, esto sería una llamada HTTP
    // return this.http.put<Rutina>(`${this.apiUrl}/${rutina.id}`, rutina);
    
    // Para desarrollo, usamos datos locales
    rutina.fechaModificacion = new Date();
    this.rutinasActivas.set(rutina.usuarioId, rutina);
    return of(rutina);
  }
  
  /**
   * Archiva una rutina activa
   */
  archivarRutina(usuarioId: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.post<boolean>(`${this.apiUrl}/usuario/${usuarioId}/archivar`, {});
    
    // Para desarrollo, usamos datos locales
    const rutina = this.rutinasActivas.get(usuarioId);
    if (!rutina) {
      return of(false);
    }
    
    // Crear entrada de historial
    const historial: HistorialRutina = {
      id: this.generarId(),
      rutinaId: rutina.id,
      usuarioId: usuarioId,
      semana: this.obtenerNumeroSemana(new Date()),
      año: new Date().getFullYear(),
      fechaInicio: new Date(rutina.fechaCreacion),
      fechaFin: new Date(),
      datosRutina: { ...rutina },
      rendimiento: 85 // Valor de ejemplo
    };
    
    // Guardar en historial
    if (!this.historialRutinas.has(usuarioId)) {
      this.historialRutinas.set(usuarioId, []);
    }
    this.historialRutinas.get(usuarioId)?.push(historial);
    
    // Eliminar rutina activa
    this.rutinasActivas.delete(usuarioId);
    
    return of(true);
  }
  
  /**
   * Obtiene el historial de rutinas de un usuario
   */
  obtenerHistorialRutinas(usuarioId: number): Observable<HistorialRutina[]> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<HistorialRutina[]>(`${this.apiUrl}/usuario/${usuarioId}/historial`);
    
    // Para desarrollo, usamos datos locales
    return of(this.historialRutinas.get(usuarioId) || []);
  }
  
  /**
   * Obtiene una rutina específica por su ID
   */
  obtenerRutina(rutinaId: number): Observable<Rutina | null> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Rutina>(`${this.apiUrl}/${rutinaId}`);
    
    // Para desarrollo, usamos datos locales
    for (const rutina of this.rutinasActivas.values()) {
      if (rutina.id === rutinaId) {
        return of(rutina);
      }
    }
    return of(null);
  }
  
  /**
   * Obtiene todas las rutinas (activas e inactivas)
   */
  obtenerRutinas(): Observable<Rutina[]> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Rutina[]>(this.apiUrl);
    
    // Para desarrollo, usamos datos locales
    const rutinas: Rutina[] = Array.from(this.rutinasActivas.values());
    
    // Añadir rutinas archivadas (del historial)
    for (const historialUsuario of this.historialRutinas.values()) {
      for (const historial of historialUsuario) {
        const rutinaArchivada = { ...historial.datosRutina, activa: false };
        rutinas.push(rutinaArchivada);
      }
    }
    
    return of(rutinas);
  }
  
  /**
   * Elimina una rutina por su ID
   */
  eliminarRutina(rutinaId: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.delete<boolean>(`${this.apiUrl}/${rutinaId}`);
    
    // Para desarrollo, usamos datos locales
    let eliminada = false;
    
    // Buscar en rutinas activas
    for (const [usuarioId, rutina] of this.rutinasActivas.entries()) {
      if (rutina.id === rutinaId) {
        this.rutinasActivas.delete(usuarioId);
        eliminada = true;
        break;
      }
    }
    
    // Buscar en historial
    if (!eliminada) {
      for (const [usuarioId, historialUsuario] of this.historialRutinas.entries()) {
        const index = historialUsuario.findIndex(h => h.rutinaId === rutinaId);
        if (index !== -1) {
          historialUsuario.splice(index, 1);
          eliminada = true;
          break;
        }
      }
    }
    
    return of(eliminada);
  }
  
  /**
   * Archiva una rutina (la marca como inactiva)
   */
  archivarRutinaById(rutinaId: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.patch<boolean>(`${this.apiUrl}/${rutinaId}/archivar`, {});
    
    // Para desarrollo, usamos datos locales
    const rutina = this.obtenerRutina(rutinaId).subscribe(rutina => {
      if (!rutina) {
        return of(false);
      }
      
      // Crear entrada de historial
      const historial: HistorialRutina = {
        id: this.generarId(),
        rutinaId: rutina.id,
        usuarioId: rutina.usuarioId,
        semana: this.obtenerNumeroSemana(new Date()),
        año: new Date().getFullYear(),
        fechaInicio: new Date(rutina.fechaCreacion),
        fechaFin: new Date(),
        datosRutina: { ...rutina },
        rendimiento: 85 // Valor de ejemplo
      };
      
      // Guardar en historial
      if (!this.historialRutinas.has(rutina.usuarioId)) {
        this.historialRutinas.set(rutina.usuarioId, []);
      }
      this.historialRutinas.get(rutina.usuarioId)?.push(historial);
      
      // Eliminar rutina activa
      this.rutinasActivas.delete(rutina.usuarioId);
      
      return of(true);
    });
    return of(false);
  }
  
  /**
   * Obtiene todas las rutinas de un usuario específico
   */
  obtenerRutinasPorUsuario(usuarioId: number): Observable<Rutina[]> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Rutina[]>(`${this.apiUrl}/usuario/${usuarioId}`);
    
    // Para desarrollo, usamos datos locales
    const rutinas: Rutina[] = [];
    
    // Añadir rutina activa si existe
    const rutinaActiva = this.rutinasActivas.get(usuarioId);
    if (rutinaActiva) {
      rutinas.push(rutinaActiva);
    }
    
    // Añadir rutinas archivadas (del historial)
    const historialUsuario = this.historialRutinas.get(usuarioId) || [];
    for (const historial of historialUsuario) {
      const rutinaArchivada = { ...historial.datosRutina, activa: false };
      rutinas.push(rutinaArchivada);
    }
    
    return of(rutinas);
  }
  
  // Métodos auxiliares
  
  /**
   * Genera un ID único para entidades
   */
  private generarId(): number {
    return Math.floor(Math.random() * 10000) + 1;
  }
  
  /**
   * Obtiene el número de semana del año para una fecha
   */
  private obtenerNumeroSemana(fecha: Date): number {
    const primerDia = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha.getTime() - primerDia.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + primerDia.getDay() + 1) / 7);
  }
  
  /**
   * Inicializa datos de prueba para desarrollo
   */
  private inicializarDatosPrueba(): void {
    // Ejemplo de rutina para el usuario 1 (Juan Pérez)
    const rutina1: Rutina = {
      id: 1,
      usuarioId: 1,
      nombre: 'Rutina de Fuerza y Acondicionamiento',
      fechaCreacion: new Date('2025-03-01'),
      fechaModificacion: new Date('2025-03-10'),
      activa: true,
      dias: [
        {
          id: 101,
          rutinaId: 1,
          nombre: 'Día 1 - Tren Superior',
          orden: 0,
          fases: [
            {
              id: 201,
              diaRutinaId: 101,
              faseId: 1,
              nombre: 'Activación',
              indicaciones: 'Realizar ejercicios de movilidad articular para preparar el cuerpo',
              orden: 0,
              ejercicios: [
                {
                  id: 1001,
                  faseRutinaId: 201,
                  ejercicioId: 1,
                  nombre: 'Movilidad de hombros con banda',
                  numSeries: 3,
                  numRepeticiones: 15,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 1, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 45
                  },
                  camara: 'Frontal',
                  indicaciones: 'Mantener los hombros relajados y el core activado durante todo el movimiento',
                  series: [],
                  correcciones: 'Evitar elevar los hombros hacia las orejas',
                  comentarios: 'Excelente ejercicio para preparar los hombros antes del entrenamiento',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1002,
                  faseRutinaId: 201,
                  ejercicioId: 2,
                  nombre: 'Rotación torácica en cuadrupedia',
                  numSeries: 2,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 0, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener la columna neutral y rotar solo desde el tórax',
                  series: [],
                  correcciones: 'No rotar desde la zona lumbar',
                  comentarios: 'Realizar el ejercicio de forma controlada',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 202,
              diaRutinaId: 101,
              faseId: 2,
              nombre: 'Fuerza Principal',
              indicaciones: 'Enfocarse en la técnica y progresión de carga',
              orden: 1,
              ejercicios: [
                {
                  id: 1003,
                  faseRutinaId: 202,
                  ejercicioId: 3,
                  nombre: 'Press de banca con barra',
                  numSeries: 4,
                  numRepeticiones: 8,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [3, 1, 1]
                  },
                  descanso: {
                    minutos: 2,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener el pecho elevado y la espalda neutra durante todo el movimiento',
                  series: [],
                  correcciones: 'No rebotar la barra en el pecho, controlar el movimiento',
                  comentarios: 'Aumentar peso progresivamente manteniendo la técnica',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1004,
                  faseRutinaId: 202,
                  ejercicioId: 4,
                  nombre: 'Dominadas con agarre prono',
                  numSeries: 4,
                  numRepeticiones: 6,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 1, 3]
                  },
                  descanso: {
                    minutos: 2,
                    segundos: 30
                  },
                  camara: 'Frontal',
                  indicaciones: 'Iniciar con brazos extendidos y subir hasta que la barbilla supere la barra',
                  series: [],
                  correcciones: 'Evitar balanceos y movimientos de kipping',
                  comentarios: 'Si es necesario, utilizar banda elástica para asistencia',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 203,
              diaRutinaId: 101,
              faseId: 3,
              nombre: 'Accesorios',
              indicaciones: 'Trabajar músculos secundarios con mayor volumen',
              orden: 2,
              ejercicios: [
                {
                  id: 1005,
                  faseRutinaId: 203,
                  ejercicioId: 5,
                  nombre: 'Elevaciones laterales con mancuernas',
                  numSeries: 3,
                  numRepeticiones: 12,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 0, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 0
                  },
                  camara: 'Frontal',
                  indicaciones: 'Elevar los brazos hasta la altura de los hombros, con codos ligeramente flexionados',
                  series: [],
                  correcciones: 'No utilizar impulso desde las piernas ni balancear el cuerpo',
                  comentarios: 'Excelente ejercicio para desarrollar los deltoides medios',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1006,
                  faseRutinaId: 203,
                  ejercicioId: 6,
                  nombre: 'Curl de bíceps con barra EZ',
                  numSeries: 3,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 1, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 15
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener los codos pegados al cuerpo y el torso estable',
                  series: [],
                  correcciones: 'No balancear el cuerpo para ayudar en la subida',
                  comentarios: 'Concentrarse en la contracción del bíceps en la parte superior',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 204,
              diaRutinaId: 101,
              faseId: 4,
              nombre: 'Recuperación',
              indicaciones: 'Estiramientos y ejercicios de movilidad para finalizar',
              orden: 3,
              ejercicios: [
                {
                  id: 1007,
                  faseRutinaId: 204,
                  ejercicioId: 7,
                  nombre: 'Estiramiento de pectorales en pared',
                  numSeries: 2,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 30, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 15
                  },
                  camara: 'Lateral',
                  indicaciones: 'Colocar el brazo en la pared formando un ángulo de 90 grados y rotar el torso en dirección opuesta',
                  series: [],
                  correcciones: 'Mantener la posición sin rebotar, sentir el estiramiento sin dolor',
                  comentarios: 'Excelente para aliviar tensión en la zona lumbar y glúteos',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1008,
                  faseRutinaId: 204,
                  ejercicioId: 8,
                  nombre: 'Foam rolling para espalda',
                  numSeries: 1,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 60, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Rodar lentamente sobre el foam roller, deteniéndose en puntos de tensión',
                  series: [],
                  correcciones: 'Respirar profundamente durante el ejercicio, no contener la respiración',
                  comentarios: 'Excelente para liberar la fascia y reducir la tensión muscular',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            }
          ]
        },
        {
          id: 102,
          rutinaId: 1,
          nombre: 'Día 2 - Tren Inferior',
          orden: 1,
          fases: [
            {
              id: 205,
              diaRutinaId: 102,
              faseId: 1,
              nombre: 'Activación',
              indicaciones: 'Movilidad de cadera y tobillos, activación glútea',
              orden: 0,
              ejercicios: [
                {
                  id: 1009,
                  faseRutinaId: 205,
                  ejercicioId: 9,
                  nombre: 'Activación de glúteos con banda',
                  numSeries: 2,
                  numRepeticiones: 15,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 1, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Colocar la banda elástica justo por encima de las rodillas y realizar abducciones de cadera',
                  series: [],
                  correcciones: 'Mantener la espalda recta y evitar compensar con la zona lumbar',
                  comentarios: 'Fundamental para activar los glúteos antes del entrenamiento de piernas',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1010,
                  faseRutinaId: 205,
                  ejercicioId: 10,
                  nombre: 'Movilidad de cadera 90/90',
                  numSeries: 2,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 0, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Frontal',
                  indicaciones: 'Sentado en el suelo, alternar entre rotación interna y externa de cadera manteniendo ángulos de 90 grados',
                  series: [],
                  correcciones: 'Mantener el torso erguido durante las transiciones',
                  comentarios: 'Excelente para mejorar la movilidad de cadera en múltiples planos',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 206,
              diaRutinaId: 102,
              faseId: 2,
              nombre: 'Fuerza Principal',
              indicaciones: 'Ejercicios compuestos para tren inferior',
              orden: 1,
              ejercicios: [
                {
                  id: 1011,
                  faseRutinaId: 206,
                  ejercicioId: 11,
                  nombre: 'Sentadilla con barra',
                  numSeries: 4,
                  numRepeticiones: 8,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [3, 1, 2]
                  },
                  descanso: {
                    minutos: 2,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener el pecho elevado y la espalda neutra durante todo el movimiento',
                  series: [],
                  correcciones: 'Las rodillas no deben colapsar hacia dentro, deben seguir la dirección de los pies',
                  comentarios: 'Ajustar la profundidad según la movilidad individual',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1012,
                  faseRutinaId: 206,
                  ejercicioId: 12,
                  nombre: 'Peso muerto rumano',
                  numSeries: 4,
                  numRepeticiones: 8,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [3, 0, 2]
                  },
                  descanso: {
                    minutos: 2,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener la espalda completamente recta, descender la barra deslizándola por las piernas',
                  series: [],
                  correcciones: 'No redondear la espalda baja, sentir el estiramiento en isquiotibiales',
                  comentarios: 'Excelente ejercicio para desarrollar fuerza posterior de la cadena',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 207,
              diaRutinaId: 102,
              faseId: 3,
              nombre: 'Accesorios',
              indicaciones: 'Trabajo de estabilidad y músculos secundarios',
              orden: 2,
              ejercicios: [
                {
                  id: 1013,
                  faseRutinaId: 207,
                  ejercicioId: 13,
                  nombre: 'Extensiones de cuádriceps en máquina',
                  numSeries: 3,
                  numRepeticiones: 12,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 1, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Extender completamente la rodilla en la parte superior del movimiento',
                  series: [],
                  correcciones: 'No usar impulso, mantener la espalda apoyada en el respaldo',
                  comentarios: 'Buen ejercicio de aislamiento para cuádriceps',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1014,
                  faseRutinaId: 207,
                  ejercicioId: 14,
                  nombre: 'Curl femoral acostado',
                  numSeries: 3,
                  numRepeticiones: 12,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 1, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Flexionar las rodillas llevando los talones hacia los glúteos',
                  series: [],
                  correcciones: 'No elevar las caderas de la superficie del banco',
                  comentarios: 'Enfocarse en la contracción de los isquiotibiales',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 208,
              diaRutinaId: 102,
              faseId: 4,
              nombre: 'Core y Recuperación',
              indicaciones: 'Trabajo de core y estiramientos finales',
              orden: 3,
              ejercicios: [
                {
                  id: 1015,
                  faseRutinaId: 208,
                  ejercicioId: 15,
                  nombre: 'Plancha abdominal',
                  numSeries: 3,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 45, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 45
                  },
                  camara: 'Lateral',
                  indicaciones: 'Mantener una línea recta desde los talones hasta la cabeza',
                  series: [],
                  correcciones: 'No dejar caer las caderas ni elevar los glúteos',
                  comentarios: 'Respirar normalmente durante la ejecución',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1016,
                  faseRutinaId: 208,
                  ejercicioId: 16,
                  nombre: 'Estiramiento de psoas',
                  numSeries: 2,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 30, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 15
                  },
                  camara: 'Lateral',
                  indicaciones: 'En posición de caballero, llevar la cadera hacia adelante manteniendo el torso erguido',
                  series: [],
                  correcciones: 'No arquear la espalda baja, mantener el core activado',
                  comentarios: 'Realizar en ambas piernas',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            }
          ]
        },
        {
          id: 103,
          rutinaId: 1,
          nombre: 'Día 3 - Full Body',
          orden: 2,
          fases: [
            {
              id: 209,
              diaRutinaId: 103,
              faseId: 1,
              nombre: 'Calentamiento Dinámico',
              indicaciones: 'Movimientos funcionales para activar todo el cuerpo',
              orden: 0,
              ejercicios: [
                {
                  id: 1017,
                  faseRutinaId: 209,
                  ejercicioId: 17,
                  nombre: 'Jumping Jacks',
                  numSeries: 2,
                  numRepeticiones: 20,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 1]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Frontal',
                  indicaciones: 'Saltar abriendo piernas y brazos simultáneamente, luego volver a la posición inicial',
                  series: [],
                  correcciones: 'Mantener el core activado y los movimientos controlados',
                  comentarios: 'Excelente para elevar la frecuencia cardíaca y activar todo el cuerpo',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1018,
                  faseRutinaId: 209,
                  ejercicioId: 18,
                  nombre: 'Escaladores (Mountain Climbers)',
                  numSeries: 2,
                  numRepeticiones: 20,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 1]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'En posición de plancha, llevar alternadamente las rodillas hacia el pecho',
                  series: [],
                  correcciones: 'Mantener las caderas estables, sin elevarlas durante el movimiento',
                  comentarios: 'Activa el core y prepara el cuerpo para ejercicios más intensos',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 210,
              diaRutinaId: 103,
              faseId: 2,
              nombre: 'Fuerza Compuesta',
              indicaciones: 'Ejercicios multiarticulares que involucran varios grupos musculares',
              orden: 1,
              ejercicios: [
                {
                  id: 1019,
                  faseRutinaId: 210,
                  ejercicioId: 19,
                  nombre: 'Clean & Press con mancuernas',
                  numSeries: 4,
                  numRepeticiones: 8,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Realizar un tirón desde posición de sentadilla, seguido de un press de hombros',
                  series: [],
                  correcciones: 'Mantener la espalda recta durante todo el movimiento',
                  comentarios: 'Ejercicio completo que trabaja piernas, espalda y hombros',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1020,
                  faseRutinaId: 210,
                  ejercicioId: 20,
                  nombre: 'Thrusters con barra',
                  numSeries: 4,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [2, 0, 1]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Combinar una sentadilla frontal con un press de hombros en un movimiento fluido',
                  series: [],
                  correcciones: 'Mantener los codos elevados durante la fase de sentadilla',
                  comentarios: 'Excelente para desarrollar fuerza y resistencia en todo el cuerpo',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 211,
              diaRutinaId: 103,
              faseId: 3,
              nombre: 'Circuito Metabólico',
              indicaciones: 'Trabajo en circuito con poco descanso para mejorar resistencia',
              orden: 2,
              ejercicios: [
                {
                  id: 1021,
                  faseRutinaId: 211,
                  ejercicioId: 21,
                  nombre: 'Burpees',
                  numSeries: 3,
                  numRepeticiones: 15,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 1]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Realizar el movimiento completo: sentadilla, plancha, flexión, salto',
                  series: [],
                  correcciones: 'Mantener la espalda recta en la fase de plancha',
                  comentarios: 'Ejercicio de alta intensidad que trabaja todo el cuerpo',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1022,
                  faseRutinaId: 211,
                  ejercicioId: 22,
                  nombre: 'Kettlebell Swings',
                  numSeries: 3,
                  numRepeticiones: 20,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 1]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Impulsar la kettlebell con las caderas, no con los brazos o la espalda',
                  series: [],
                  correcciones: 'Mantener el core activado y la espalda neutra durante todo el movimiento',
                  comentarios: 'Excelente para desarrollar potencia de cadera y resistencia cardiovascular',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 212,
              diaRutinaId: 103,
              faseId: 4,
              nombre: 'Movilidad y Flexibilidad',
              indicaciones: 'Estiramientos profundos y trabajo de movilidad articular',
              orden: 3,
              ejercicios: [
                {
                  id: 1023,
                  faseRutinaId: 212,
                  ejercicioId: 23,
                  nombre: 'Estiramiento del piramidal',
                  numSeries: 2,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 30, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 15
                  },
                  camara: 'Lateral',
                  indicaciones: 'Acostado boca arriba, cruzar una pierna sobre la otra y tirar suavemente hacia el pecho',
                  series: [],
                  correcciones: 'Mantener ambos hombros apoyados en el suelo durante el estiramiento',
                  comentarios: 'Excelente para aliviar tensión en la zona lumbar y glúteos',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1024,
                  faseRutinaId: 212,
                  ejercicioId: 24,
                  nombre: 'Yoga: Postura del niño',
                  numSeries: 1,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 60, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Arrodillado, extender los brazos hacia adelante y bajar el pecho hacia el suelo',
                  series: [],
                  correcciones: 'Respirar profundamente y relajar los hombros',
                  comentarios: 'Postura restaurativa que estira la espalda y relaja el sistema nervioso',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            }
          ]
        },
        {
          id: 104,
          rutinaId: 1,
          nombre: 'Día 4 - Funcional',
          orden: 3,
          fases: [
            {
              id: 213,
              diaRutinaId: 104,
              faseId: 1,
              nombre: 'Activación Funcional',
              indicaciones: 'Ejercicios de movilidad y activación específicos para patrones funcionales',
              orden: 0,
              ejercicios: [
                {
                  id: 1025,
                  faseRutinaId: 213,
                  ejercicioId: 25,
                  nombre: 'Inchworms',
                  numSeries: 2,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 0, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Lateral',
                  indicaciones: 'Desde posición de pie, flexionar hacia adelante, caminar con las manos hasta posición de plancha y regresar',
                  series: [],
                  correcciones: 'Mantener las piernas extendidas durante el movimiento si es posible',
                  comentarios: 'Excelente para activar la cadena posterior y preparar el cuerpo para movimientos funcionales',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1026,
                  faseRutinaId: 213,
                  ejercicioId: 26,
                  nombre: 'Sentadilla con rotación',
                  numSeries: 2,
                  numRepeticiones: 12,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [2, 0, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 30
                  },
                  camara: 'Frontal',
                  indicaciones: 'Realizar una sentadilla y al subir rotar el torso hacia un lado, alternando lados',
                  series: [],
                  correcciones: 'Mantener el peso en los talones durante la sentadilla',
                  comentarios: 'Activa los músculos estabilizadores y mejora la movilidad de cadera y columna',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 214,
              diaRutinaId: 104,
              faseId: 2,
              nombre: 'Potencia y Coordinación',
              indicaciones: 'Ejercicios explosivos y de coordinación neuromuscular',
              orden: 1,
              ejercicios: [
                {
                  id: 1027,
                  faseRutinaId: 214,
                  ejercicioId: 27,
                  nombre: 'Saltos con caja (Box Jumps)',
                  numSeries: 4,
                  numRepeticiones: 8,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 2]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Saltar sobre una caja o plataforma elevada, aterrizando con las rodillas ligeramente flexionadas',
                  series: [],
                  correcciones: 'Aterrizar suavemente con las rodillas alineadas con los pies',
                  comentarios: 'Excelente para desarrollar potencia en tren inferior',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1028,
                  faseRutinaId: 214,
                  ejercicioId: 28,
                  nombre: 'Lanzamiento de balón medicinal',
                  numSeries: 3,
                  numRepeticiones: 10,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [1, 0, 0]
                  },
                  descanso: {
                    minutos: 1,
                    segundos: 0
                  },
                  camara: 'Lateral',
                  indicaciones: 'Lanzar el balón contra una pared desde posición de sentadilla, atraparlo al rebote',
                  series: [],
                  correcciones: 'Utilizar la fuerza de piernas y core para el lanzamiento, no solo brazos',
                  comentarios: 'Desarrolla potencia y coordinación de todo el cuerpo',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 215,
              diaRutinaId: 104,
              faseId: 3,
              nombre: 'Resistencia Muscular',
              indicaciones: 'Series largas con peso moderado para mejorar resistencia muscular',
              orden: 2,
              ejercicios: [
                {
                  id: 1029,
                  faseRutinaId: 215,
                  ejercicioId: 29,
                  nombre: 'Remo con mancuerna a una mano',
                  numSeries: 3,
                  numRepeticiones: 15,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [2, 1, 2]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 45
                  },
                  camara: 'Lateral',
                  indicaciones: 'Apoyar una mano y rodilla en un banco, mantener la espalda paralela al suelo',
                  series: [],
                  correcciones: 'No rotar el torso durante el movimiento, mantener el core activado',
                  comentarios: 'Excelente para desarrollar resistencia en la musculatura de la espalda',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1030,
                  faseRutinaId: 215,
                  ejercicioId: 30,
                  nombre: 'Zancadas alternadas con mancuernas',
                  numSeries: 3,
                  numRepeticiones: 20,
                  tempo: {
                    tipo: 'bajada-pausa-subida',
                    tiempos: [2, 0, 1]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 45
                  },
                  camara: 'Lateral',
                  indicaciones: 'Dar un paso adelante alternando piernas, manteniendo el torso erguido',
                  series: [],
                  correcciones: 'La rodilla delantera no debe sobrepasar la punta del pie',
                  comentarios: 'Trabaja piernas unilateralmente y mejora el equilibrio',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            },
            {
              id: 216,
              diaRutinaId: 104,
              faseId: 4,
              nombre: 'Enfriamiento Activo',
              indicaciones: 'Ejercicios de baja intensidad y estiramientos para recuperación',
              orden: 3,
              ejercicios: [
                {
                  id: 1031,
                  faseRutinaId: 216,
                  ejercicioId: 31,
                  nombre: 'Caminata con respiración profunda',
                  numSeries: 1,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 180, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 0
                  },
                  camara: 'Frontal',
                  indicaciones: 'Caminar a ritmo lento, realizando respiraciones profundas (4 segundos inhalar, 6 segundos exhalar)',
                  series: [],
                  correcciones: 'Mantener una postura erguida y relajada',
                  comentarios: 'Ayuda a normalizar la frecuencia cardíaca y respiratoria',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 0
                },
                {
                  id: 1032,
                  faseRutinaId: 216,
                  ejercicioId: 32,
                  nombre: 'Secuencia de estiramientos dinámicos',
                  numSeries: 1,
                  numRepeticiones: 1,
                  tempo: {
                    tipo: 'subida-pausa-bajada',
                    tiempos: [0, 300, 0]
                  },
                  descanso: {
                    minutos: 0,
                    segundos: 0
                  },
                  camara: 'Frontal',
                  indicaciones: 'Realizar una secuencia de estiramientos suaves para todos los grupos musculares trabajados',
                  series: [],
                  correcciones: 'Mantener los estiramientos sin llegar al punto de dolor',
                  comentarios: 'Fundamental para reducir la tensión muscular y prevenir lesiones',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  orden: 1
                }
              ]
            }
          ]
        }
      ]
    };
    
    // Ejemplo de rutina para el usuario 2
    const rutina2: Rutina = {
      id: 2,
      usuarioId: 2,
      nombre: 'Rutina de Hipertrofia',
      fechaCreacion: new Date('2025-02-15'),
      fechaModificacion: new Date('2025-03-05'),
      activa: true,
      dias: []
    };
    
    // Ejemplo de historial para el usuario 3
    const historial3: HistorialRutina[] = [
      {
        id: 301,
        rutinaId: 3,
        usuarioId: 3,
        semana: 10,
        año: 2025,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-01'),
        datosRutina: {
          id: 3,
          usuarioId: 3,
          nombre: 'Rutina Anterior',
          fechaCreacion: new Date('2025-01-01'),
          fechaModificacion: new Date('2025-02-15'),
          activa: false,
          dias: []
        },
        rendimiento: 75
      }
    ];
    
    // Guardar datos de prueba
    this.rutinasActivas.set(1, rutina1);
    this.rutinasActivas.set(2, rutina2);
    this.historialRutinas.set(3, historial3);
  }
}

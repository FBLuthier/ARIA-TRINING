import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError, timer } from 'rxjs';
import { catchError, map, tap, shareReplay, finalize, switchMap, timeout } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3000/api';
  
  // Control de estado de la conexión
  private isConnected = new BehaviorSubject<boolean>(true);
  
  // Objetos para almacenar los datos cacheados
  private cachedDeportes: any[] = [];
  private cachedUsuarios: any[] = [];
  private cachedPosiciones: {[deporteId: number]: any[]} = {};
  private cachedEntrenadores: any[] = [];
  private cachedClientes: any[] = [];
  
  // Observables cacheados
  private cachedDeportesObservable: Observable<any[]> | null = null;
  private cachedUsuariosObservable: Observable<any[]> | null = null;
  private cachedPosicionesObservable: {[deporteId: number]: Observable<any[]>} = {};
  private cachedEntrenadoresObservable: Observable<any> | null = null;
  private cachedClientesObservable: Observable<any> | null = null;
  
  // Tiempo tras el cual se eliminará un observable cacheado
  private cacheTimeout = 60000; // 1 minuto
  
  // Datos predeterminados
  private deportesPredeterminados = [
    { id: 1, nombre: 'Fútbol' },
    { id: 2, nombre: 'Baloncesto' },
    { id: 3, nombre: 'Voleibol' },
    { id: 4, nombre: 'Natación' },
    { id: 5, nombre: 'Atletismo' },
    { id: 6, nombre: 'Tenis' },
    { id: 7, nombre: 'Fútbol Americano' },
    { id: 8, nombre: 'Béisbol' },
    { id: 9, nombre: 'Rugby' }
  ];
  
  private usuariosPredeterminados = [
    {
      id: 1,
      primerNombre: 'Juan',
      segundoNombre: 'Carlos',
      primerApellido: 'García',
      segundoApellido: 'Pérez',
      telefono: '123456789',
      email: 'juan@example.com',
      dob: '1990-01-01',
      programa: 'Pérdida de peso',
      deporte: 'Fútbol',
      deporteId: 1,
      deporteNombre: 'Fútbol',
      posicion: 'Delantero',
      posicionId: 1,
      posicionNombre: 'Delantero',
      tieneRutina: true,
      tieneHistorialRutinas: true
    },
    {
      id: 2,
      primerNombre: 'Ana',
      segundoNombre: 'María',
      primerApellido: 'López',
      segundoApellido: 'Sánchez',
      telefono: '987654321',
      email: 'ana@example.com',
      dob: '1992-05-15',
      programa: 'Hipertrofia',
      deporte: 'Natación',
      deporteId: 2,
      deporteNombre: 'Natación',
      posicion: 'Estilo libre',
      posicionId: 5,
      posicionNombre: 'Estilo libre',
      tieneRutina: false,
      tieneHistorialRutinas: false
    },
    {
      id: 3,
      primerNombre: 'Pedro',
      primerApellido: 'Martínez',
      telefono: '555555555',
      email: 'pedro@example.com',
      dob: '1988-12-10',
      programa: 'Recomposición',
      deporte: 'Baloncesto',
      deporteId: 3,
      deporteNombre: 'Baloncesto',
      posicion: 'Base',
      posicionId: 10,
      posicionNombre: 'Base',
      tieneRutina: true,
      tieneHistorialRutinas: true
    }
  ];
  
  private posicionesPredeterminadas: { [deporteId: number]: any[] } = {
    1: [ // Fútbol
      { id: 101, nombre: 'Portero', deporteId: 1 },
      { id: 102, nombre: 'Defensa Central', deporteId: 1 },
      { id: 103, nombre: 'Lateral Derecho', deporteId: 1 },
      { id: 104, nombre: 'Lateral Izquierdo', deporteId: 1 },
      { id: 105, nombre: 'Mediocentro', deporteId: 1 },
      { id: 106, nombre: 'Centrocampista Ofensivo', deporteId: 1 },
      { id: 107, nombre: 'Extremo Derecho', deporteId: 1 },
      { id: 108, nombre: 'Extremo Izquierdo', deporteId: 1 },
      { id: 109, nombre: 'Delantero Centro', deporteId: 1 }
    ],
    2: [ // Natación
      { id: 201, nombre: 'Estilo Libre', deporteId: 2 },
      { id: 202, nombre: 'Mariposa', deporteId: 2 },
      { id: 203, nombre: 'Espalda', deporteId: 2 },
      { id: 204, nombre: 'Pecho', deporteId: 2 },
      { id: 205, nombre: 'Combinado', deporteId: 2 }
    ],
    3: [ // Baloncesto
      { id: 301, nombre: 'Base', deporteId: 3 },
      { id: 302, nombre: 'Escolta', deporteId: 3 },
      { id: 303, nombre: 'Alero', deporteId: 3 },
      { id: 304, nombre: 'Ala-Pívot', deporteId: 3 },
      { id: 305, nombre: 'Pívot', deporteId: 3 }
    ],
    4: [ // Voleibol
      { id: 401, nombre: 'Colocador', deporteId: 4 },
      { id: 402, nombre: 'Opuesto', deporteId: 4 },
      { id: 403, nombre: 'Central', deporteId: 4 },
      { id: 404, nombre: 'Receptor', deporteId: 4 },
      { id: 405, nombre: 'Líbero', deporteId: 4 }
    ]
  };
  
  // Para cualquier otro deporte, usamos estas posiciones genéricas
  private posicionesGenericas = [
    { id: 901, nombre: 'Jugador' },
    { id: 902, nombre: 'Entrenador' },
    { id: 903, nombre: 'Asistente' }
  ];
  
  // Contador de intentos de conexión fallidos
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private connectionBackoffTime = 5000; // 5 segundos
  
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  /**
   * Obtiene la lista de usuarios
   */
  getUsuarios(): Observable<any[]> {
    console.log('DatabaseService: Solicitando usuarios...');
    
    // Verificar primero si ya tenemos datos en caché
    if (this.cachedUsuarios.length > 0) {
      console.log('DatabaseService: Devolviendo usuarios desde caché:', this.cachedUsuarios.length);
      return of(this.cachedUsuarios);
    }
    
    // Verificar si ya hay una solicitud en curso
    if (this.cachedUsuariosObservable) {
      console.log('DatabaseService: Ya hay una solicitud de usuarios en curso');
      return this.cachedUsuariosObservable;
    }
    
    console.log('DatabaseService: Creando nueva solicitud de usuarios');
    
    // Crear un nuevo observable y guardarlo en caché
    this.cachedUsuariosObservable = this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Si no hay conexión, usar datos predeterminados
          console.log('DatabaseService: No hay conexión, usando datos predeterminados');
          return of(this.usuariosPredeterminados);
        }
        
        console.log('DatabaseService: Intentando obtener usuarios del servidor:', `${this.apiUrl}/usuarios`);
        
        // Si hay conexión, intentar obtener los datos del servidor con un timeout de 10 segundos
        return this.http.get<any[]>(`${this.apiUrl}/usuarios`).pipe(
          timeout(10000), // 10 segundos de timeout
          tap(usuarios => {
            console.log('DatabaseService: Usuarios recibidos del servidor:', usuarios?.length || 0);
            // Actualizar la caché con los datos recibidos
            this.cachedUsuarios = usuarios;
            // Indicar que hay conexión
            this.connectionAttempts = 0;
            this.isConnected.next(true);
            this.notificationService.setOnline();
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('DatabaseService: Error al obtener usuarios:', error);
            this.handleConnectionError('usuarios', error);
            console.log('DatabaseService: Devolviendo datos predeterminados tras error');
            return of(this.usuariosPredeterminados);
          })
        );
      }),
      shareReplay(1),
      finalize(() => {
        // Eliminar el observable cacheado después de un tiempo
        timer(this.cacheTimeout).subscribe(() => {
          console.log('DatabaseService: Limpiando caché de observable de usuarios');
          this.cachedUsuariosObservable = null as unknown as Observable<any[]>;
        });
      })
    );
    
    return this.cachedUsuariosObservable;
  }

  /**
   * Obtiene la lista de deportes
   */
  getDeportes(): Observable<any[]> {
    // Verificar primero si ya tenemos datos en caché
    if (this.cachedDeportes.length > 0) {
      return of(this.cachedDeportes);
    }
    
    // Verificar si ya hay una solicitud en curso
    if (this.cachedDeportesObservable) {
      return this.cachedDeportesObservable;
    }
    
    // Si la aplicación ya está en modo offline, devolver datos predeterminados inmediatamente
    if (this.notificationService.isOffline()) {
      return of(this.deportesPredeterminados);
    }
    
    // Crear un nuevo observable y guardarlo en caché
    this.cachedDeportesObservable = this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Si no hay conexión, usar datos predeterminados
          return of(this.deportesPredeterminados);
        }
        
        // Si hay conexión, intentar obtener los datos del servidor
        return this.http.get<any[]>(`${this.apiUrl}/deportes`).pipe(
          tap(deportes => {
            // Actualizar la caché con los datos recibidos
            this.cachedDeportes = deportes;
            // Indicar que hay conexión
            this.connectionAttempts = 0;
            this.isConnected.next(true);
            this.notificationService.setOnline();
          }),
          catchError((error: HttpErrorResponse) => {
            this.handleConnectionError('deportes', error);
            return of(this.deportesPredeterminados);
          })
        );
      }),
      shareReplay(1),
      finalize(() => {
        // Eliminar el observable cacheado después de un tiempo
        timer(this.cacheTimeout).subscribe(() => {
          this.cachedDeportesObservable = null as unknown as Observable<any[]>;
        });
      })
    );
    
    return this.cachedDeportesObservable;
  }

  /**
   * Obtiene las posiciones para un deporte específico
   */
  obtenerPosicionesPorDeporte(deporteId: number): Observable<any[]> {
    // Verificar primero si ya tenemos datos en caché para este deporte
    if (this.cachedPosiciones[deporteId] && this.cachedPosiciones[deporteId].length > 0) {
      return of(this.cachedPosiciones[deporteId]);
    }
    
    // Verificar si ya hay una solicitud en curso para este deporte
    if (this.cachedPosicionesObservable[deporteId]) {
      return this.cachedPosicionesObservable[deporteId];
    }
    
    // Si la aplicación ya está en modo offline, devolver datos predeterminados inmediatamente
    if (this.notificationService.isOffline()) {
      return of(this.getPosicionesPredeterminadas(deporteId));
    }
    
    // Crear un nuevo observable y guardarlo en caché
    this.cachedPosicionesObservable[deporteId] = this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Si no hay conexión, usar datos predeterminados
          return of(this.getPosicionesPredeterminadas(deporteId));
        }
        
        // Si hay conexión, intentar obtener los datos del servidor
        return this.http.get<any[]>(`${this.apiUrl}/posiciones/${deporteId}`).pipe(
          tap(posiciones => {
            // Actualizar la caché con los datos recibidos
            this.cachedPosiciones[deporteId] = posiciones;
            // Indicar que hay conexión
            this.connectionAttempts = 0;
            this.isConnected.next(true);
            this.notificationService.setOnline();
          }),
          catchError((error: HttpErrorResponse) => {
            this.handleConnectionError('posiciones', error);
            return of(this.getPosicionesPredeterminadas(deporteId));
          })
        );
      }),
      shareReplay(1),
      finalize(() => {
        // Eliminar el observable cacheado después de un tiempo
        timer(this.cacheTimeout).subscribe(() => {
          this.cachedPosicionesObservable[deporteId] = null as unknown as Observable<any[]>;
        });
      })
    );
    
    return this.cachedPosicionesObservable[deporteId];
  }

  /**
   * Maneja errores de conexión de manera centralizada
   */
  private handleConnectionError(resource: string, error: HttpErrorResponse): void {
    this.connectionAttempts++;
    
    if (error.status === 0) {
      // Error de conexión (servidor no disponible)
      this.isConnected.next(false);
      
      // Notificar al servicio de notificaciones
      this.notificationService.setOffline(`No se puede conectar al servidor para obtener ${resource}.`);
      
      // Log sólo si es el primer intento o después de cierto número de intentos
      if (this.connectionAttempts === 1 || this.connectionAttempts % this.maxConnectionAttempts === 0) {
        console.warn(`Error de conexión al obtener ${resource}. Usando datos predeterminados.`);
      }
    } else {
      // Otros errores HTTP
      console.error(`Error al obtener ${resource}:`, error.message);
    }
  }

  /**
   * Obtiene las posiciones predeterminadas para un deporte
   */
  private getPosicionesPredeterminadas(deporteId: number): any[] {
    return this.posicionesPredeterminadas[deporteId] || this.posicionesGenericas;
  }

  /**
   * Crea un nuevo usuario
   */
  createUsuario(usuario: any): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      const nuevoUsuario = {
        ...usuario,
        id: Date.now() // Generar un ID temporal
      };
      return of({ success: true, data: nuevoUsuario });
    }
    
    return this.http.post<any>(`${this.apiUrl}/usuarios`, usuario).pipe(
      tap(() => {
        // Limpiar la caché de usuarios para forzar una recarga
        this.cachedUsuarios = [];
        this.cachedUsuariosObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('crear usuario', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUsuario(id: number, usuario: any): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      return of({ success: true, data: { ...usuario, id } });
    }
    
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, usuario).pipe(
      tap(() => {
        // Limpiar la caché de usuarios para forzar una recarga
        this.cachedUsuarios = [];
        this.cachedUsuariosObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('actualizar usuario', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUsuario(id: number): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      return of({ success: true });
    }
    
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`).pipe(
      tap(() => {
        // Limpiar la caché de usuarios para forzar una recarga
        this.cachedUsuarios = [];
        this.cachedUsuariosObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('eliminar usuario', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fuerza el modo sin conexión (útil para pruebas)
   */
  forceOfflineMode(offline: boolean): void {
    this.isConnected.next(!offline);
    
    if (offline) {
      this.notificationService.setOffline('Modo sin conexión forzado manualmente.');
    } else {
      this.notificationService.setOnline();
    }
  }

  /**
   * Inicializa los deportes predeterminados en el servidor
   */
  inicializarDeportes(): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      return of({ success: true, message: 'Operación simulada en modo sin conexión' });
    }
    
    return this.http.get<any>(`${this.apiUrl}/inicializar-deportes`).pipe(
      tap(() => {
        // Limpiar la caché de deportes para forzar una recarga
        this.cachedDeportes = [];
        this.cachedDeportesObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('inicializar deportes', error);
        return of({ success: false, message: 'Error al inicializar deportes' });
      })
    );
  }
  
  /**
   * Crea un nuevo deporte
   */
  crearDeporte(deporte: any): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      const nuevoDeporte = {
        ...deporte,
        id: Date.now() // Generar un ID temporal
      };
      return of({ success: true, data: nuevoDeporte });
    }
    
    return this.http.post<any>(`${this.apiUrl}/deportes`, deporte).pipe(
      tap(() => {
        // Limpiar la caché de deportes para forzar una recarga
        this.cachedDeportes = [];
        this.cachedDeportesObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('crear deporte', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Actualiza un deporte existente
   */
  actualizarDeporte(id: number, deporte: any): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      return of({ success: true, data: { ...deporte, id } });
    }
    
    return this.http.put<any>(`${this.apiUrl}/deportes/${id}`, deporte).pipe(
      tap(() => {
        // Limpiar la caché de deportes para forzar una recarga
        this.cachedDeportes = [];
        this.cachedDeportesObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('actualizar deporte', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Elimina un deporte
   */
  eliminarDeporte(id: number): Observable<any> {
    // Si no hay conexión, simular una respuesta exitosa
    if (!this.isConnected.value) {
      return of({ success: true });
    }
    
    return this.http.delete<any>(`${this.apiUrl}/deportes/${id}`).pipe(
      tap(() => {
        // Limpiar la caché de deportes para forzar una recarga
        this.cachedDeportes = [];
        this.cachedDeportesObservable = null as unknown as Observable<any[]>;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleConnectionError('eliminar deporte', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Prueba la conexión con el servidor de la API
   * @returns Observable con el estado de la conexión
   */
  testConnection(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test-connection`).pipe(
      map(response => {
        this.isConnected.next(true);
        this.notificationService.setOnline();
        return { success: true, message: 'Conexión exitosa con la base de datos' };
      }),
      catchError((error: HttpErrorResponse) => {
        this.isConnected.next(false);
        this.notificationService.setOffline();
        return of({ success: false, message: 'Error al conectar con la base de datos' });
      })
    );
  }

  /**
   * Obtiene la lista de entrenadores
   * @returns Observable con los entrenadores
   */
  getEntrenadores(): Observable<any> {
    // Verificar primero si ya tenemos datos en caché
    if (this.cachedEntrenadores.length > 0) {
      return of({ success: true, data: this.cachedEntrenadores });
    }
    
    // Verificar si ya hay una solicitud en curso
    if (this.cachedEntrenadoresObservable) {
      return this.cachedEntrenadoresObservable;
    }
    
    // Crear un nuevo observable y guardarlo en caché
    this.cachedEntrenadoresObservable = this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Datos predeterminados para entrenadores si no hay conexión
          const entrenadoresPredeterminados = [
            { id: 1, nombre: 'Juan', apellido: 'Pérez', especialidad: 'Fuerza' },
            { id: 2, nombre: 'María', apellido: 'López', especialidad: 'Cardio' },
            { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', especialidad: 'Nutrición' }
          ];
          return of({ success: true, data: entrenadoresPredeterminados });
        }
        
        // Si hay conexión, intentar obtener los datos del servidor
        return this.http.get<any>(`${this.apiUrl}/entrenadores`).pipe(
          map(response => {
            // Actualizar la caché con los datos recibidos
            this.cachedEntrenadores = response.data || response;
            return { success: true, data: this.cachedEntrenadores };
          }),
          catchError((error: HttpErrorResponse) => {
            const entrenadoresPredeterminados = [
              { id: 1, nombre: 'Juan', apellido: 'Pérez', especialidad: 'Fuerza' },
              { id: 2, nombre: 'María', apellido: 'López', especialidad: 'Cardio' },
              { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', especialidad: 'Nutrición' }
            ];
            return of({ success: true, data: entrenadoresPredeterminados });
          })
        );
      }),
      shareReplay(1),
      finalize(() => {
        // Eliminar el observable cacheado después de un tiempo
        timer(this.cacheTimeout).subscribe(() => {
          this.cachedEntrenadoresObservable = null;
        });
      })
    );
    
    return this.cachedEntrenadoresObservable;
  }

  /**
   * Obtiene la lista de clientes
   * @returns Observable con los clientes
   */
  getClientes(): Observable<any> {
    // Verificar primero si ya tenemos datos en caché
    if (this.cachedClientes.length > 0) {
      return of({ success: true, data: this.cachedClientes });
    }
    
    // Verificar si ya hay una solicitud en curso
    if (this.cachedClientesObservable) {
      return this.cachedClientesObservable;
    }
    
    // Crear un nuevo observable y guardarlo en caché
    this.cachedClientesObservable = this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Datos predeterminados para clientes si no hay conexión
          const clientesPredeterminados = [
            { id: 1, nombre: 'Ana', apellido: 'Gómez', objetivo: 'Pérdida de peso' },
            { id: 2, nombre: 'Luis', apellido: 'Martínez', objetivo: 'Tonificación' },
            { id: 3, nombre: 'Elena', apellido: 'Sánchez', objetivo: 'Aumento de masa muscular' }
          ];
          return of({ success: true, data: clientesPredeterminados });
        }
        
        // Si hay conexión, intentar obtener los datos del servidor
        return this.http.get<any>(`${this.apiUrl}/clientes`).pipe(
          map(response => {
            // Actualizar la caché con los datos recibidos
            this.cachedClientes = response.data || response;
            return { success: true, data: this.cachedClientes };
          }),
          catchError((error: HttpErrorResponse) => {
            const clientesPredeterminados = [
              { id: 1, nombre: 'Ana', apellido: 'Gómez', objetivo: 'Pérdida de peso' },
              { id: 2, nombre: 'Luis', apellido: 'Martínez', objetivo: 'Tonificación' },
              { id: 3, nombre: 'Elena', apellido: 'Sánchez', objetivo: 'Aumento de masa muscular' }
            ];
            return of({ success: true, data: clientesPredeterminados });
          })
        );
      }),
      shareReplay(1),
      finalize(() => {
        // Eliminar el observable cacheado después de un tiempo
        timer(this.cacheTimeout).subscribe(() => {
          this.cachedClientesObservable = null;
        });
      })
    );
    
    return this.cachedClientesObservable;
  }

  /**
   * Actualiza una posición
   * @param id ID de la posición a actualizar
   * @param posicion Datos de la posición
   * @returns Observable con la respuesta
   */
  actualizarPosicion(id: number, posicion: any): Observable<any> {
    return this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          return throwError(() => new Error('No hay conexión con el servidor'));
        }
        
        return this.http.put<any>(`${this.apiUrl}/posiciones/${id}`, posicion).pipe(
          tap(() => {
            // Actualizar la caché si es necesario
            if (this.cachedPosiciones[posicion.deporte_id]) {
              const index = this.cachedPosiciones[posicion.deporte_id].findIndex(p => p.id === id);
              if (index !== -1) {
                this.cachedPosiciones[posicion.deporte_id][index] = { ...posicion };
              }
            }
          }),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Obtiene las posiciones por nombre de deporte
   * @param nombreDeporte Nombre del deporte
   * @returns Observable con las posiciones
   */
  obtenerPosicionesPorNombreDeporte(nombreDeporte: string): Observable<any[]> {
    return this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          // Buscar en los datos predeterminados
          const deporteId = this.deportesPredeterminados.find(d => d.nombre === nombreDeporte)?.id;
          if (deporteId && this.posicionesPredeterminadas[deporteId]) {
            return of(this.posicionesPredeterminadas[deporteId]);
          }
          return of(this.posicionesGenericas);
        }
        
        // Si hay conexión, intentar obtener los datos del servidor
        return this.http.get<any[]>(`${this.apiUrl}/posiciones/deporte/${encodeURIComponent(nombreDeporte)}`).pipe(
          catchError((error: HttpErrorResponse) => {
            // Buscar en los datos predeterminados
            const deporteId = this.deportesPredeterminados.find(d => d.nombre === nombreDeporte)?.id;
            if (deporteId && this.posicionesPredeterminadas[deporteId]) {
              return of(this.posicionesPredeterminadas[deporteId]);
            }
            return of(this.posicionesGenericas);
          })
        );
      })
    );
  }

  /**
   * Desactiva un usuario
   * @param usuario Usuario a desactivar
   * @returns Observable con la respuesta
   */
  desactivarUsuario(usuario: any): Observable<any> {
    return this.isConnected.pipe(
      switchMap(connected => {
        if (!connected) {
          return throwError(() => new Error('No hay conexión con el servidor'));
        }
        
        return this.http.put<any>(`${this.apiUrl}/usuarios/${usuario.id}/desactivar`, {}).pipe(
          tap(() => {
            // Actualizar la caché si es necesario
            if (this.cachedUsuarios.length > 0) {
              const index = this.cachedUsuarios.findIndex(u => u.id === usuario.id);
              if (index !== -1) {
                this.cachedUsuarios[index] = { ...this.cachedUsuarios[index], activo: false };
              }
            }
          }),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
          })
        );
      })
    );
  }
}

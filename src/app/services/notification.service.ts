import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationState {
  offline: boolean;
  message: string;
  lastConnectionAttempt: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private connectionState = new BehaviorSubject<NotificationState>({
    offline: false,
    message: '',
    lastConnectionAttempt: null
  });

  constructor() { }

  /**
   * Obtiene el estado actual de la conexión como Observable
   */
  getConnectionState(): Observable<NotificationState> {
    return this.connectionState.asObservable();
  }

  /**
   * Marca la aplicación como offline cuando hay problemas de conexión
   */
  setOffline(message: string = 'No se puede conectar al servidor. Funcionando en modo sin conexión.'): void {
    // Solo actualizar si el estado cambia o si han pasado al menos 5 segundos desde el último intento
    const currentState = this.connectionState.value;
    const now = new Date();
    
    if (!currentState.offline || 
        !currentState.lastConnectionAttempt || 
        now.getTime() - currentState.lastConnectionAttempt.getTime() > 5000) {
      
      this.connectionState.next({
        offline: true,
        message,
        lastConnectionAttempt: now
      });
    }
  }

  /**
   * Marca la aplicación como online cuando la conexión se restablece
   */
  setOnline(): void {
    if (this.connectionState.value.offline) {
      this.connectionState.next({
        offline: false,
        message: '',
        lastConnectionAttempt: new Date()
      });
    }
  }

  /**
   * Comprueba si la aplicación está actualmente en modo offline
   */
  isOffline(): boolean {
    return this.connectionState.value.offline;
  }
}

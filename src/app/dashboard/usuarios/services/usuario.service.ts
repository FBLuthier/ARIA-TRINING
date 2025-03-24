import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  // Datos de prueba para desarrollo
  private usuarios: Usuario[] = [
    {
      id: 1,
      primerNombre: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      email: 'juan.perez@example.com',
      telefono: '123456789',
      fechaNacimiento: new Date('1990-05-15'),
      genero: 'masculino',
      altura: 180,
      peso: 75,
      objetivo: 'Aumentar masa muscular',
      nivelActividad: 'activo',
      fechaRegistro: new Date('2024-01-10'),
      activo: true,
      fotoPerfil: 'assets/img/profiles/user1.jpg',
      notas: 'Cliente comprometido con su entrenamiento'
    },
    {
      id: 2,
      primerNombre: 'María',
      primerApellido: 'López',
      email: 'maria.lopez@example.com',
      fechaNacimiento: new Date('1995-08-20'),
      genero: 'femenino',
      altura: 165,
      peso: 60,
      objetivo: 'Tonificar',
      nivelActividad: 'moderado',
      fechaRegistro: new Date('2024-02-05'),
      activo: true
    },
    {
      id: 3,
      primerNombre: 'Carlos',
      primerApellido: 'Rodríguez',
      email: 'carlos.rodriguez@example.com',
      telefono: '987654321',
      fechaRegistro: new Date('2023-11-15'),
      activo: false
    }
  ];
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene todos los usuarios
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Usuario[]>(this.apiUrl);
    
    // Para desarrollo, usamos datos locales
    return of(this.usuarios);
  }
  
  /**
   * Obtiene un usuario por su ID
   */
  obtenerUsuario(id: number): Observable<Usuario | null> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    
    // Para desarrollo, usamos datos locales
    const usuario = this.usuarios.find(u => u.id === id);
    return of(usuario || null);
  }
  
  /**
   * Crea un nuevo usuario
   */
  crearUsuario(usuario: Usuario): Observable<Usuario> {
    // En producción, esto sería una llamada HTTP
    // return this.http.post<Usuario>(this.apiUrl, usuario);
    
    // Para desarrollo, usamos datos locales
    usuario.id = this.generarId();
    usuario.fechaRegistro = new Date();
    usuario.activo = true;
    
    this.usuarios.push(usuario);
    return of(usuario);
  }
  
  /**
   * Actualiza un usuario existente
   */
  actualizarUsuario(usuario: Usuario): Observable<Usuario> {
    // En producción, esto sería una llamada HTTP
    // return this.http.put<Usuario>(`${this.apiUrl}/${usuario.id}`, usuario);
    
    // Para desarrollo, usamos datos locales
    const index = this.usuarios.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      this.usuarios[index] = usuario;
      return of(usuario);
    }
    return of(null as any);
  }
  
  /**
   * Desactiva un usuario
   */
  desactivarUsuario(id: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.patch<boolean>(`${this.apiUrl}/${id}/desactivar`, {});
    
    // Para desarrollo, usamos datos locales
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.activo = false;
      return of(true);
    }
    return of(false);
  }
  
  /**
   * Elimina un usuario
   */
  eliminarUsuario(id: number): Observable<boolean> {
    // En producción, esto sería una llamada HTTP
    // return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    
    // Para desarrollo, usamos datos locales
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
  
  /**
   * Obtiene usuarios activos
   */
  obtenerUsuariosActivos(): Observable<Usuario[]> {
    // En producción, esto sería una llamada HTTP
    // return this.http.get<Usuario[]>(`${this.apiUrl}/activos`);
    
    // Para desarrollo, usamos datos locales
    return of(this.usuarios.filter(u => u.activo));
  }
  
  // Métodos auxiliares
  
  /**
   * Genera un ID único para entidades
   */
  private generarId(): number {
    return Math.floor(Math.random() * 10000) + 1;
  }
}

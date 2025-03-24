import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private loginUrl = environment.loginUrl;

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión y obtener el token
  login(credentials: { username: string; password: string }) {
    return this.http.post(this.loginUrl, credentials);
  }

  // Método para obtener datos del usuario (requiere token)
  getUserData(token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Incluye el token en las cabeceras
    });
    return this.http.get(`${this.apiUrl}/user`, { headers });
  }
}
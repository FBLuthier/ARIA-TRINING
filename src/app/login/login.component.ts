import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' }; // Almacena las credenciales del usuario
  errorMessage = ''; // Mensaje de error si las credenciales son incorrectas
  loading = false; // Indica si se está procesando la solicitud

  constructor(private apiService: ApiService, private router: Router) {}

  // Método para iniciar sesión
  login() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor ingresa usuario y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.apiService.login(this.credentials).subscribe({
      next: (response: any) => {
        const token = response.token; // Extrae el token de la respuesta
        if (token) {
          localStorage.setItem('authToken', token); // Guarda el token en localStorage
          this.router.navigate(['/dashboard']); // Redirige al dashboard
        } else {
          this.errorMessage = 'No se recibió un token válido'; // Mensaje de error
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error de autenticación:', error);
        this.errorMessage = 'Credenciales incorrectas o servidor no disponible'; // Muestra un mensaje de error
        this.loading = false;
      }
    });
  }
}
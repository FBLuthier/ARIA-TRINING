import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  logout() {
    // Eliminar el token de autenticación
    localStorage.removeItem('authToken');
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
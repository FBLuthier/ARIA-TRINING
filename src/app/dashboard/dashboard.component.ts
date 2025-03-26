import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var bootstrap: any; // Declaración para usar Bootstrap JS

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Estado de los menús - todos colapsados por defecto
  menuState = {
    administracion: false,
    entrenamiento: false,
    ejercicios: false,
    fases: false,
    rutinas: false,
    parametrizacion: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Inicialización del componente
  }

  ngAfterViewInit() {
    // Inicializar los tooltips y popovers de Bootstrap si los hay
    if (typeof bootstrap !== 'undefined') {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }

  // Método para alternar la visibilidad de un menú
  toggleMenu(menu: string) {
    if (this.menuState.hasOwnProperty(menu)) {
      (this.menuState as any)[menu] = !(this.menuState as any)[menu];
    }
  }

  // Método para verificar si un menú está abierto
  isMenuOpen(menu: string): boolean {
    return (this.menuState as any)[menu] === true;
  }

  // Método para cerrar sesión
  logout() {
    // Eliminar el token de autenticación
    localStorage.removeItem('authToken');
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
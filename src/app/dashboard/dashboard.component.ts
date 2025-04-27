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
  // Estado de los menús (abierto/cerrado)
  menuState: { [key: string]: boolean } = {
    administracion: false,
    parametrizacion: false,
    herramientas: false
  };

  // Estado de los submenús (abierto/cerrado)
  submenuState: { [key: string]: boolean } = {
    ejercicios: false,
    fases: false,
    rutinas: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Inicialización del componente
    // Determinar qué menú debe estar abierto según la ruta actual
    this.setInitialMenuState();
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

  // Método para determinar el estado inicial de los menús según la ruta actual
  setInitialMenuState() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/dashboard/usuarios')) {
      this.menuState['administracion'] = true;
    } else if (currentUrl.includes('/dashboard/ejercicios')) {
      this.menuState['parametrizacion'] = true;
      this.submenuState['ejercicios'] = true;
    } else if (currentUrl.includes('/dashboard/fases')) {
      this.menuState['parametrizacion'] = true;
      this.submenuState['fases'] = true;
    } else if (currentUrl.includes('/dashboard/rutinas')) {
      this.menuState['parametrizacion'] = true;
      this.submenuState['rutinas'] = true;
    } else if (currentUrl.includes('/dashboard/db-test')) {
      this.menuState['herramientas'] = true;
    }
  }

  // Método para alternar el estado de un menú principal
  toggleMenu(menuKey: string) {
    this.menuState[menuKey] = !this.menuState[menuKey];
  }

  // Método para verificar si un menú está abierto
  isMenuOpen(menuKey: string): boolean {
    return this.menuState[menuKey];
  }

  // Método para alternar el estado de un submenú
  toggleSubmenu(submenuKey: string) {
    this.submenuState[submenuKey] = !this.submenuState[submenuKey];
  }

  // Método para verificar si un submenú está abierto
  isSubmenuOpen(submenuKey: string): boolean {
    return this.submenuState[submenuKey];
  }

  // Método para cerrar sesión
  logout() {
    // Eliminar el token de autenticación
    localStorage.removeItem('authToken');
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
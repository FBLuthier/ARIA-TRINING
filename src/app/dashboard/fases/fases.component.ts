import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Fase {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
}

@Component({
  selector: 'app-fases',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fases.component.html',
  styleUrls: ['./fases.component.css']
})
export class FasesComponent {
  // Datos de ejemplo para fases
  fases: Fase[] = [];

  constructor() {
    // Cargar datos de ejemplo (esto se reemplazará con una llamada a API)
    this.cargarFasesEjemplo();
  }

  cargarFasesEjemplo() {
    // Esto es solo para demostración, se reemplazará con datos reales de la API
    this.fases = [
      { id: 1, nombre: 'Fase de Adaptación', descripcion: 'Fase inicial para adaptación al entrenamiento', duracion: 4 },
      { id: 2, nombre: 'Fase de Fuerza', descripcion: 'Enfocada en desarrollo de fuerza muscular', duracion: 6 },
      { id: 3, nombre: 'Fase de Hipertrofia', descripcion: 'Orientada al crecimiento muscular', duracion: 8 }
    ];
  }

  editarFase(id: number) {
    console.log('Editar fase con ID:', id);
    // Implementar navegación a la página de edición
  }

  eliminarFase(id: number) {
    console.log('Eliminar fase con ID:', id);
    // Implementar confirmación y eliminación
    this.fases = this.fases.filter(fase => fase.id !== id);
  }
}

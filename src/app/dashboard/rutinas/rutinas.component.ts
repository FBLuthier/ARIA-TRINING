import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RutinaService } from './services/rutina.service';
import { UsuarioService } from '../usuarios/services/usuario.service';
import { Rutina } from './models/rutina.model';
import { Usuario } from '../usuarios/models/usuario.model';
import { CrearRutinasComponent } from './crear-rutinas/crear-rutinas.component';
import { VerRutinaComponent } from './ver-rutina/ver-rutina.component';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearRutinasComponent, VerRutinaComponent],
  templateUrl: './rutinas.component.html',
  styleUrls: ['./rutinas.component.css']
})
export class RutinasComponent implements OnInit {
  // Propiedades para la lista de rutinas
  rutinas: Rutina[] = [];
  rutinasOriginal: Rutina[] = [];
  cargando: boolean = false;
  error: string | null = null;
  
  // Propiedades para la gestión de usuarios
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  usuarioIdSeleccionado: number | null = null;
  
  // Propiedades para la gestión de modales
  mostrarCrearRutina: boolean = false;
  mostrarVerRutina: boolean = false;
  rutinaSeleccionada: Rutina | null = null;
  modoEdicion: boolean = false;
  
  // Filtros
  mostrarArchivadas: boolean = false;

  constructor(
    private rutinaService: RutinaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Métodos para cargar datos
  cargarRutinas(): void {
    if (!this.usuarioIdSeleccionado) return;
    
    this.cargando = true;
    this.error = null;
    
    this.rutinaService.obtenerRutinasPorUsuario(this.usuarioIdSeleccionado).subscribe({
      next: (rutinas: Rutina[]) => {
        this.rutinas = rutinas;
        this.rutinasOriginal = [...rutinas];
        this.filtrarRutinas();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar rutinas:', err);
        this.error = 'No se pudieron cargar las rutinas. Por favor, intente de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  // Método para seleccionar un usuario
  seleccionarUsuario(): void {
    if (this.usuarioIdSeleccionado) {
      this.usuarioSeleccionado = this.usuarios.find(u => u.id === this.usuarioIdSeleccionado) || null;
      this.cargarRutinas();
    } else {
      this.usuarioSeleccionado = null;
      this.rutinas = [];
      this.rutinasOriginal = [];
    }
  }

  // Métodos para filtrar y buscar
  filtrarRutinas(): void {
    // Filtrar por estado (activas/archivadas)
    this.rutinas = this.rutinasOriginal.filter(rutina => 
      this.mostrarArchivadas ? !rutina.activa : rutina.activa
    );
  }

  mostrarRutinasActivas(): void {
    this.mostrarArchivadas = false;
    this.filtrarRutinas();
  }

  mostrarRutinasArchivadas(): void {
    this.mostrarArchivadas = true;
    this.filtrarRutinas();
  }

  // Métodos para gestionar rutinas
  crearNuevaRutina(): void {
    if (!this.usuarioIdSeleccionado) {
      alert('Por favor, seleccione un usuario antes de crear una rutina.');
      return;
    }
    
    this.rutinaSeleccionada = null;
    this.modoEdicion = false;
    this.mostrarCrearRutina = true;
    this.mostrarVerRutina = false;
  }

  editarRutina(rutina: Rutina): void {
    this.rutinaSeleccionada = { ...rutina };
    this.modoEdicion = true;
    this.mostrarCrearRutina = true;
    this.mostrarVerRutina = false;
  }

  verRutina(rutina: Rutina): void {
    this.rutinaSeleccionada = rutina;
    this.mostrarVerRutina = true;
    this.mostrarCrearRutina = false;
  }

  archivarRutina(rutina: Rutina): void {
    if (confirm(`¿Está seguro que desea archivar la rutina "${rutina.nombre}"?`)) {
      this.rutinaService.archivarRutinaById(rutina.id).subscribe({
        next: () => {
          this.cargarRutinas();
        },
        error: (err: any) => {
          console.error('Error al archivar rutina:', err);
          this.error = 'No se pudo archivar la rutina. Por favor, intente de nuevo más tarde.';
        }
      });
    }
  }

  eliminarRutina(rutina: Rutina): void {
    if (confirm(`¿Está seguro que desea eliminar la rutina "${rutina.nombre}"? Esta acción no se puede deshacer.`)) {
      this.rutinaService.eliminarRutina(rutina.id).subscribe({
        next: () => {
          this.cargarRutinas();
        },
        error: (err: any) => {
          console.error('Error al eliminar rutina:', err);
          this.error = 'No se pudo eliminar la rutina. Por favor, intente de nuevo más tarde.';
        }
      });
    }
  }

  // Métodos para gestionar modales
  cerrarModalCrearRutina(): void {
    this.mostrarCrearRutina = false;
  }

  cerrarModalVerRutina(): void {
    this.mostrarVerRutina = false;
  }

  onRutinaGuardada(rutina: Rutina): void {
    this.cerrarModalCrearRutina();
    this.cargarRutinas();
  }

  // Métodos auxiliares
  obtenerNombreUsuario(usuarioId: number): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? `${usuario.primerNombre} ${usuario.primerApellido}` : 'Usuario desconocido';
  }
}

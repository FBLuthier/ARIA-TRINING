import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  
  // Propiedades para el buscador de usuarios
  terminoBusqueda: string = '';
  resultadosBusqueda: Usuario[] = [];
  mostrarResultados: boolean = false;
  
  // Propiedades para la gestión de modales
  mostrarCrearRutina: boolean = false;
  mostrarVerRutina: boolean = false;
  mostrarSeleccionUsuario: boolean = false; // Nueva propiedad para mostrar la selección de usuario
  rutinaSeleccionada: Rutina | null = null;
  modoEdicion: boolean = false;
  
  // Filtros
  mostrarArchivadas: boolean = false;

  constructor(
    private rutinaService: RutinaService,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    
    // Verificar si se accede desde la ruta "rutinas/crear"
    this.route.data.subscribe(data => {
      if (data['accion'] === 'crear') {
        this.crearNuevaRutina();
      }
    });
  }

  // Método para cerrar la lista de resultados cuando se hace clic fuera
  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent): void {
    // Verificar si el clic fue dentro del buscador o los resultados
    const target = event.target as HTMLElement;
    if (!target.closest('.input-group') && !target.closest('.position-relative')) {
      this.mostrarResultados = false;
    }
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

  // Métodos para el buscador de usuarios
  buscarUsuarios(): void {
    this.mostrarResultados = true;
    
    if (!this.terminoBusqueda.trim()) {
      this.resultadosBusqueda = [];
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.resultadosBusqueda = this.usuarios.filter(usuario => 
      usuario.primerNombre.toLowerCase().includes(termino) || 
      usuario.primerApellido.toLowerCase().includes(termino)
    ).slice(0, 5); // Limitar a 5 resultados para no sobrecargar la UI
  }

  seleccionarUsuarioBuscado(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.usuarioIdSeleccionado = usuario.id;
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    this.mostrarResultados = false;
    
    // Si estamos en el modo de selección de usuario para crear rutina,
    // avanzamos al formulario de creación
    if (this.mostrarSeleccionUsuario) {
      this.mostrarSeleccionUsuario = false;
      this.mostrarCrearRutina = true;
    } else {
      this.cargarRutinas();
    }
  }

  limpiarSeleccion(): void {
    this.usuarioSeleccionado = null;
    this.usuarioIdSeleccionado = null;
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    this.rutinas = [];
    this.rutinasOriginal = [];
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
    // Primero mostramos la pantalla de selección de usuario
    this.limpiarSeleccion(); // Limpiamos la selección actual para empezar de cero
    this.mostrarSeleccionUsuario = true;
    this.mostrarCrearRutina = false;
    this.mostrarVerRutina = false;
  }

  // Método para continuar con la creación de rutina después de seleccionar usuario
  continuarCreacionRutina(): void {
    if (!this.usuarioIdSeleccionado) {
      alert('Por favor, seleccione un usuario antes de continuar.');
      return;
    }
    
    this.mostrarSeleccionUsuario = false;
    this.rutinaSeleccionada = null;
    this.modoEdicion = false;
    this.mostrarCrearRutina = true;
    this.mostrarVerRutina = false;
  }

  // Método para cancelar la selección de usuario
  cancelarSeleccionUsuario(): void {
    this.mostrarSeleccionUsuario = false;
    this.limpiarSeleccion();
    // Redirigir de vuelta a la lista de rutinas si se accedió desde la ruta "rutinas/crear"
    this.router.navigate(['/dashboard/rutinas']);
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
    this.cargarRutinas();
    // Redirigir de vuelta a la lista de rutinas
    this.router.navigate(['/dashboard/rutinas']);
  }

  cerrarModalVerRutina(): void {
    this.mostrarVerRutina = false;
  }

  // Método para manejar el evento de rutina guardada
  onRutinaGuardada(rutina: Rutina): void {
    this.cargarRutinas();
    // Redirigir de vuelta a la lista de rutinas
    this.router.navigate(['/dashboard/rutinas']);
  }

  // Método para obtener el nombre del usuario
  obtenerNombreUsuario(usuarioId: number): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? `${usuario.primerNombre} ${usuario.primerApellido}` : 'Usuario Desconocido';
  }
}

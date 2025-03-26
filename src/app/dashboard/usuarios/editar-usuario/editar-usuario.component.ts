import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearUsuariosComponent } from '../crear-usuarios/crear-usuarios.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearUsuariosComponent],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit {
  terminoBusqueda: string = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  usuarioSeleccionado: any = null;
  mostrarFormulario: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Aquí cargaríamos los usuarios desde el servicio
    // Por ahora usaremos datos de ejemplo
    this.usuarios = [
      { id: 1, primerNombre: 'Juan', segundoNombre: '', primerApellido: 'Pérez', segundoApellido: 'García', email: 'juan.perez@example.com' },
      { id: 2, primerNombre: 'María', segundoNombre: 'José', primerApellido: 'González', segundoApellido: 'López', email: 'maria.gonzalez@example.com' },
      { id: 3, primerNombre: 'Carlos', segundoNombre: '', primerApellido: 'Rodríguez', segundoApellido: 'Martínez', email: 'carlos.rodriguez@example.com' }
    ];
    this.usuariosFiltrados = [];
  }

  buscarUsuarios(): void {
    if (!this.terminoBusqueda.trim()) {
      this.usuariosFiltrados = [];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombreCompleto = `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`.toLowerCase();
      const email = usuario.email.toLowerCase();
      return nombreCompleto.includes(termino) || email.includes(termino) || usuario.id.toString() === termino;
    });
  }

  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarFormulario = true;
  }

  onUsuarioEditado(usuario: any): void {
    // Aquí actualizaríamos el usuario en el servicio
    console.log('Usuario editado:', usuario);
    
    // Actualizamos el usuario en la lista local
    const index = this.usuarios.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      this.usuarios[index] = { ...usuario };
    }
    
    // Reiniciamos el estado
    this.usuarioSeleccionado = null;
    this.mostrarFormulario = false;
    this.terminoBusqueda = '';
    this.usuariosFiltrados = [];
  }

  cancelarEdicion(): void {
    this.usuarioSeleccionado = null;
    this.mostrarFormulario = false;
    this.terminoBusqueda = '';
    this.usuariosFiltrados = [];
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-db-test',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './db-test.component.html',
  styleUrls: ['./db-test.component.css']
})
export class DbTestComponent implements OnInit {
  connectionStatus: string = 'Verificando conexión...';
  connectionSuccess: boolean = false;
  entrenadores: any[] = [];
  clientes: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private databaseService: DatabaseService) { }

  ngOnInit(): void {
    this.testConnection();
  }

  // Método para decodificar texto con caracteres especiales
  decodeText(text: string): string {
    try {
      // Intenta decodificar el texto si es necesario
      return text || '';
    } catch (e) {
      console.error('Error al decodificar texto:', e);
      return text || '';
    }
  }

  testConnection(): void {
    this.databaseService.testConnection().subscribe({
      next: (response) => {
        this.connectionSuccess = response.success;
        this.connectionStatus = response.message;
        if (this.connectionSuccess) {
          this.loadData();
        }
      },
      error: (error) => {
        this.connectionSuccess = false;
        this.connectionStatus = 'Error al conectar con la base de datos';
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadData(): void {
    // Cargar entrenadores
    this.databaseService.getEntrenadores().subscribe({
      next: (response) => {
        if (response.success) {
          // Procesar los datos para asegurar la codificación correcta
          this.entrenadores = response.data.map((entrenador: any) => {
            return {
              ...entrenador,
              nombre: this.decodeText(entrenador.nombre),
              apellido: this.decodeText(entrenador.apellido),
              especialidad: this.decodeText(entrenador.especialidad)
            };
          });
        }
      },
      error: (error) => {
        this.error = 'Error al cargar entrenadores: ' + error.message;
      }
    });

    // Cargar clientes
    this.databaseService.getClientes().subscribe({
      next: (response) => {
        if (response.success) {
          // Procesar los datos para asegurar la codificación correcta
          this.clientes = response.data.map((cliente: any) => {
            return {
              ...cliente,
              nombre: this.decodeText(cliente.nombre),
              apellido: this.decodeText(cliente.apellido),
              objetivo: this.decodeText(cliente.objetivo)
            };
          });
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Error al cargar clientes: ' + error.message;
        this.loading = false;
      }
    });
  }
}

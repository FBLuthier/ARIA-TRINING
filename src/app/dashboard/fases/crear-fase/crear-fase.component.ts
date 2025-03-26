import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-fase',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-fase.component.html',
  styleUrls: ['./crear-fase.component.css']
})
export class CrearFaseComponent {
  faseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.faseForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      duracion: [4, [Validators.required, Validators.min(1), Validators.max(52)]],
      objetivo: ['', Validators.required]
    });
  }

  guardarFase() {
    if (this.faseForm.valid) {
      console.log('Datos de la fase:', this.faseForm.value);
      // Aquí se implementará la lógica para guardar la fase en la base de datos
      
      // Redirigir a la lista de fases
      this.router.navigate(['/dashboard/fases']);
    } else {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.faseForm.controls).forEach(key => {
        const control = this.faseForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  cancelar() {
    this.router.navigate(['/dashboard/fases']);
  }
}

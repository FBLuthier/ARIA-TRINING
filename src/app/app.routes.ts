import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import { UsuariosComponent } from './dashboard/usuarios/usuarios.component';
import { RutinasComponent } from './dashboard/rutinas/rutinas.component';
import { EjerciciosComponent} from './dashboard/ejercicios/ejercicios.component';
// Importamos componentes adicionales con los nombres correctos
import { CrearUsuariosComponent } from './dashboard/usuarios/crear-usuarios/crear-usuarios.component';
import { EditarUsuarioComponent } from './dashboard/usuarios/editar-usuario/editar-usuario.component';
import { CrearEjerciciosComponent } from './dashboard/ejercicios/crear-ejercicios/crear-ejercicios.component';
import { FasesComponent } from './dashboard/fases/fases.component';
import { CrearFaseComponent } from './dashboard/fases/crear-fase/crear-fase.component';
import { CrearRutinasComponent } from './dashboard/rutinas/crear-rutinas/crear-rutinas.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      // Rutas de Administración
      {
        path: 'usuarios',
        component: UsuariosComponent
      },
      {
        path: 'usuarios/crear',
        component: CrearUsuariosComponent
      },
      {
        path: 'usuarios/editar',
        component: EditarUsuarioComponent
      },
      
      // Rutas de Entrenamiento - Ejercicios
      {
        path: 'ejercicios',
        component: EjerciciosComponent
      },
      {
        path: 'ejercicios/crear',
        component: CrearEjerciciosComponent
      },
      
      // Rutas de Entrenamiento - Fases
      {
        path: 'fases',
        component: FasesComponent
      },
      {
        path: 'fases/crear',
        component: CrearFaseComponent
      },
      
      // Rutas de Entrenamiento - Rutinas
      {
        path: 'rutinas',
        component: RutinasComponent
      },
      {
        path: 'rutinas/crear',
        component: RutinasComponent,
        data: { accion: 'crear' }
      }
      
      // Nota: Las rutas de Parametrización se definirán más adelante
    ]
  },
  // Ruta de redirección para rutas no encontradas
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
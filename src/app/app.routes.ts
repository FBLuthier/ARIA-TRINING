import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import { UsuariosComponent } from './dashboard/usuarios/usuarios.component';
import { RutinasComponent } from './dashboard/rutinas/rutinas.component';
import { EjerciciosComponent} from './dashboard/ejercicios/ejercicios.component';

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
      {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
      },
      {
        path: 'usuarios',
        component: UsuariosComponent
      },
      {
        path: 'rutinas',
        component: RutinasComponent
      },
      {
        path: 'ejercicios',
        component: EjerciciosComponent
      }
    ]
  },
  // Rutas independientes para acceso directo
  {
    path: 'usuarios',
    component: UsuariosComponent
  },
  {
    path: 'rutinas',
    component: RutinasComponent
  },
  {
    path: 'ejercicios',
    component: EjerciciosComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
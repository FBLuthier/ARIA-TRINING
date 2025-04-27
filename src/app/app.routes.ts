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
import { EditarEjercicioComponent } from './dashboard/ejercicios/editar-ejercicio/editar-ejercicio.component';
import { FasesComponent } from './dashboard/fases/fases.component';
import { CrearFaseComponent } from './dashboard/fases/crear-fase/crear-fase.component';
import { CrearRutinasComponent } from './dashboard/rutinas/crear-rutinas/crear-rutinas.component';
import { DbTestComponent } from './components/db-test/db-test.component';
// Importamos los nuevos componentes de herramientas
import { DeportesComponent } from './dashboard/herramientas/deportes/deportes.component';
import { PosicionesComponent } from './dashboard/herramientas/posiciones/posiciones.component';

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
      {
        path: 'ejercicios/editar',
        component: EditarEjercicioComponent
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
        component: CrearRutinasComponent,
        data: { accion: 'crear' }
      },
      
      // Ruta para probar la conexión a la base de datos
      {
        path: 'db-test',
        component: DbTestComponent
      },
      
      // Rutas para herramientas - Deportes y Posiciones
      {
        path: 'herramientas/deportes',
        component: DeportesComponent
      },
      {
        path: 'herramientas/posiciones',
        component: PosicionesComponent
      }
      
      // Nota: Las rutas de Parametrización se definirán más adelante
    ]
  },
  // Ruta independiente para probar la conexión a la base de datos
  {
    path: 'db-test',
    component: DbTestComponent
  },
  // Ruta de redirección para rutas no encontradas
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Nuevo enfoque
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Importa las rutas

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Registra las rutas aquí
    provideHttpClient(withInterceptorsFromDi()), // Usa el nuevo enfoque para HttpClient
  ],
}).catch(err => console.error(err));
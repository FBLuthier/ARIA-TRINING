import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

// Función para cargar Bootstrap solo en el navegador
function loadBootstrap() {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    // Importar Bootstrap solo en el navegador
    import('bootstrap');
  }
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Cargar Bootstrap después de que la aplicación se haya inicializado
    loadBootstrap();
  })
  .catch((err) => console.error(err));
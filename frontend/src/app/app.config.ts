import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
<<<<<<< HEAD
    provideZoneChangeDetection({ eventCoalescing: true }), 
=======
    provideZoneChangeDetection({ eventCoalescing: true }),
>>>>>>> 4e456ae (Front: correção de bugs e atualizações)
    provideRouter(routes),
    provideHttpClient()
  ]
};
